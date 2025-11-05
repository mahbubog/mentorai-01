import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, AlertCircle, CheckCircle, Loader2, Search, XCircle } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { CourseCategoryRow, CourseCategoryInsert, CourseCategoryUpdate } from '../../lib/database.types';
import { slugify } from '../../utils/slugify';

interface CategoryLoadData extends CourseCategoryRow {
  course_categories_mapping: { count: number }[];
}

interface CategoryWithCount extends CourseCategoryRow {
  course_count: number;
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [isNewSlugEditable, setIsNewSlugEditable] = useState(false);

  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editedCategorySlug, setEditedCategorySlug] = useState('');
  const [isEditedSlugEditable, setIsEditedSlugEditable] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isNewSlugEditable && newCategoryName) {
      setNewCategorySlug(slugify(newCategoryName));
    }
  }, [newCategoryName, isNewSlugEditable]);

  // Removed the useEffect for editedCategorySlug to prevent potential re-render issues
  // useEffect(() => {
  //   if (editingCategory && !isEditedSlugEditable && editedCategoryName) {
  //     setEditedCategorySlug(slugify(editedCategoryName));
  //   }
  // }, [editedCategoryName, isEditedSlugEditable, editingCategory]);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('course_categories')
        .select(`
          *,
          course_categories_mapping(count)
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const categoriesWithCount = (data as CategoryLoadData[] || []).map(cat => ({
        ...cat,
        course_count: cat.course_categories_mapping?.[0]?.count || 0,
      }));
      setCategories(categoriesWithCount);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewCategoryName('');
    setNewCategorySlug('');
    setIsNewSlugEditable(false);
    setEditingCategory(null);
    setEditedCategoryName('');
    setEditedCategorySlug('');
    setIsEditedSlugEditable(false);
    setError(null);
    setMessage(null);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    if (!newCategoryName.trim() || !newCategorySlug.trim()) {
      setError('Category name and slug are required.');
      setSaving(false);
      return;
    }

    try {
      const newDisplayOrder = categories.length > 0 ? Math.max(...categories.map(c => c.display_order || 0)) + 1 : 0;

      const categoryData: CourseCategoryInsert = {
        name: newCategoryName.trim(),
        slug: newCategorySlug.trim(),
        display_order: newDisplayOrder,
      };

      const { error: insertError } = await supabase
        .from('course_categories')
        .insert([categoryData as CourseCategoryInsert]);

      if (insertError) throw insertError;

      setMessage('Category added successfully!');
      loadCategories();
      resetForm();
    } catch (err: any) {
      console.error('Error adding category:', err);
      setError('Failed to add category: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name || ''); // Ensure string fallback
    // Auto-slugify if not editable, otherwise use existing slug
    setEditedCategorySlug(isEditedSlugEditable ? (category.slug || '') : slugify(category.name || '')); 
    setIsEditedSlugEditable(false);
    setError(null);
    setMessage(null);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    if (!editedCategoryName.trim() || !editedCategorySlug.trim()) {
      setError('Category name and slug are required.');
      setSaving(false);
      return;
    }

    try {
      const updateData: CourseCategoryUpdate = {
        name: editedCategoryName.trim(),
        slug: editedCategorySlug.trim(),
      };

      const { error: updateError } = await supabase
        .from('course_categories')
        .update(updateData as CourseCategoryUpdate)
        .eq('id', editingCategory.id);

      if (updateError) throw updateError;

      setMessage('Category updated successfully!');
      loadCategories();
      resetForm();
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError('Failed to update category: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: CategoryWithCount) => {
    if (category.course_count > 0) {
      alert(`Cannot delete category "${category.name}" because it is associated with ${category.course_count} course(s). Please remove courses from this category first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('course_categories')
        .delete()
        .eq('id', category.id);

      if (deleteError) throw deleteError;

      setMessage('Category deleted successfully!');
      loadCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category: ' + err.message);
    }
  };

  const handleReorderCategory = useCallback(async (categoryId: string, direction: 'up' | 'down') => {
    setSaving(true);
    setError(null);
    setMessage(null);

    const index = categories.findIndex(cat => cat.id === categoryId);
    if (index === -1) {
      setSaving(false);
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) {
      setSaving(false);
      return; // Cannot move further
    }

    const updatedCategories = [...categories];
    const [movedCategory] = updatedCategories.splice(index, 1);
    updatedCategories.splice(newIndex, 0, movedCategory);

    // Optimistically update UI
    setCategories(updatedCategories);

    try {
      // Update display_order for affected categories
      const updates: CourseCategoryUpdate[] = updatedCategories.map((cat, idx) => ({
        id: cat.id,
        display_order: idx,
      }));

      const { error: updateError } = await supabase
        .from('course_categories')
        .upsert(updates as CourseCategoryUpdate[], { onConflict: 'id' });

      if (updateError) throw updateError;

      setMessage('Category reordered successfully!');
    } catch (err: any) {
      console.error('Error reordering category:', err);
      setError('Failed to reorder category: ' + err.message);
      loadCategories(); // Reload to revert optimistic update if error
    } finally {
      setSaving(false);
    }
  }, [categories]);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories Management</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-green-600 text-sm">{message}</p>
          </div>
        )}

        {/* Add New Category Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <Label htmlFor="newCategoryName">Category Name <span className="text-red-500">*</span></Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Web Development"
                required
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="newCategorySlug">Category Slug <span className="text-red-500">*</span></Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="newCategorySlug"
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value)}
                  disabled={!isNewSlugEditable || saving}
                  placeholder="web-development"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewSlugEditable(!isNewSlugEditable)}
                  disabled={saving}
                >
                  {isNewSlugEditable ? 'Lock' : 'Edit'}
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Category...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Existing Categories</h2>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No categories found.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCategories.map((category, index) => (
                <div key={category.id} className="flex items-center justify-between py-4">
                  {editingCategory?.id === category.id ? (
                    <form onSubmit={handleUpdateCategory} className="flex-1 flex items-center space-x-2">
                      <Input
                        value={editedCategoryName}
                        onChange={(e) => setEditedCategoryName(e.target.value)}
                        placeholder="Category Name"
                        className="flex-1"
                        required
                        disabled={saving}
                      />
                      <div className="flex items-center space-x-1">
                        <Input
                          value={editedCategorySlug}
                          onChange={(e) => setEditedCategorySlug(e.target.value)}
                          disabled={!isEditedSlugEditable || saving}
                          placeholder="category-slug"
                          className="w-32"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditedSlugEditable(!isEditedSlugEditable)}
                          disabled={saving}
                        >
                          {isEditedSlugEditable ? 'Lock' : 'Edit'}
                        </Button>
                      </div>
                      <Button type="submit" size="sm" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={resetForm} disabled={saving}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    <div className="flex-1 flex items-center space-x-4">
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <span className="text-sm text-gray-500">({category.slug})</span>
                      {category.course_count > 0 && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {category.course_count} Courses
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorderCategory(category.id, 'up')}
                      disabled={index === 0 || saving}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorderCategory(category.id, 'down')}
                      disabled={index === filteredCategories.length - 1 || saving}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(category)}
                      disabled={saving}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      disabled={saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}