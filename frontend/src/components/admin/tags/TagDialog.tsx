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
import { adminCreateTag, adminUpdateTag } from "../../../services/TagService";
import { toast } from "react-toastify";

interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: {
    tag_id?: string;
    tag_name?: string;
    tag_slug?: string;
    tag_description?: string;
  };
  onSuccess: () => void;
}

export default function TagDialog({ open, onOpenChange, tag, onSuccess }: TagDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!tag?.tag_id;

  useEffect(() => {
    if (open) {
      if (isEdit && tag) {
        setName(tag.tag_name || "");
        setSlug(tag.tag_slug || "");
        setDescription(tag.tag_description || "");
      } else {
        setName("");
        setSlug("");
        setDescription("");
      }
    }
  }, [open, isEdit, tag]);

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
    if (!name.trim() || !slug.trim() || !description.trim()) return;

    setLoading(true);
    try {
      let result;
      if (isEdit && tag?.tag_id) {
        result = await adminUpdateTag(tag.tag_id, name, slug, description);
        toast.success('Cập nhật thẻ thành công');
        onSuccess();
        onOpenChange(false);
      } else {
        result = await adminCreateTag(name, slug, description);
        toast.success('Tạo thẻ thành công');
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error submitting tag:', error);
      // Display specific error message from backend
      const errorMessage = error.message || (isEdit ? 'Cập nhật thẻ thất bại' : 'Tạo thẻ thất bại');
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
            {isEdit ? "Sửa thẻ" : "Thêm thẻ mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Cập nhật thông tin thẻ" 
              : "Tạo thẻ mới cho blog của bạn"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Tên thẻ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nhập tên thẻ..."
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
              placeholder="the-slug"
            />
            <p className="text-sm text-gray-500">
              URL thân thiện cho thẻ này
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">
              Mô tả <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả thẻ..."
              rows={3}
            />
            <p className="text-sm text-gray-500">
              Mô tả ngắn gọn về thẻ này
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