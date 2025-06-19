'use client';

import { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { adminCreateCategory, adminUpdateCategory } from "../../../services/CategoryService";
import { toast } from "react-toastify";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: {
    category_id?: string;
    category_name?: string;
    category_description?: string;
    category_slug?: string;
  };
  onSuccess: () => void;
}

export default function CategoryDialog({ open, onOpenChange, category, onSuccess }: CategoryDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!category?.category_id;

  useEffect(() => {
    if (open) {
      if (isEdit && category) {
        setName(category.category_name || "");
        setDescription(category.category_description || "");
        setSlug(category.category_slug || "");
      } else {
        setName("");
        setDescription("");
        setSlug("");
      }
    }
  }, [open, isEdit, category]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) return;

    setLoading(true);
    try {
      let result;
      if (isEdit && category?.category_id) {
        result = await adminUpdateCategory(category.category_id, name, description, slug);
        toast.success('Cập nhật danh mục thành công');
        onSuccess();
        onOpenChange(false);
      } else {
        result = await adminCreateCategory(name, description, slug);
        toast.success('Tạo danh mục thành công');
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error submitting category:', error);
      const errorMessage = error.message || (isEdit ? 'Cập nhật danh mục thất bại' : 'Tạo danh mục thất bại');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Cập nhật thông tin danh mục" 
              : "Tạo danh mục mới cho blog của bạn"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Tên danh mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nhập tên danh mục..."
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả danh mục..."
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="danh-muc-slug"
            />
            <p className="text-sm text-gray-500">
              URL thân thiện cho danh mục này
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name.trim() || !slug.trim() || !description.trim() || loading}
            className="bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900"
          >
            {loading ? "Đang xử lý..." : (isEdit ? "Cập nhật" : "Tạo mới")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
