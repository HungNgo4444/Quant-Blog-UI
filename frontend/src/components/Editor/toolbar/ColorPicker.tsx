'use client';

import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Palette, X } from 'lucide-react';

interface ColorPickerProps {
  colors: string[];
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  onRemoveColor?: () => void;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onColorSelect,
  onRemoveColor,
  title = 'Chọn màu',
  icon = <Palette className="h-4 w-4" />,
  className = '',
}) => {
  const [customColor, setCustomColor] = useState('#000000');
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setIsOpen(false);
  };

  const handleCustomColorApply = () => {
    onColorSelect(customColor);
    setIsOpen(false);
  };

  const handleRemoveColor = () => {
    onRemoveColor?.();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${className}`}
          style={{
            backgroundColor: selectedColor ? selectedColor : 'transparent',
            border: selectedColor ? '2px solid #e5e7eb' : '1px solid #e5e7eb',
          }}
        >
          {selectedColor ? (
            <div className="w-4 h-4 rounded" style={{ backgroundColor: selectedColor }} />
          ) : (
            icon
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{title}</Label>
            {onRemoveColor && selectedColor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveColor}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Predefined Colors */}
          <div className="grid grid-cols-8 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                  selectedColor === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Custom Color Picker */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-600">Màu tùy chỉnh</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-12 h-8 p-0 border-0 cursor-pointer"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#000000"
                className="flex-1 h-8 text-xs"
              />
              <Button
                size="sm"
                onClick={handleCustomColorApply}
                className="h-8 px-3 text-xs"
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker; 