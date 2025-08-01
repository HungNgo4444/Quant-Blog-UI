import { Extension } from '@tiptap/core';

export const StyleExtension = Extension.create({
  name: 'styleExtension',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {};
              }
              return { style: attributes.style };
            },
          },
          indent: {
            default: 0,
            parseHTML: element => {
              const style = element.getAttribute('style') || '';
              const match = style.match(/text-indent:\s*(\d+)px/);
              return match ? Math.round(parseInt(match[1]) / 40) : 0;
            },
            renderHTML: attributes => {
              // This will be handled by the style attribute
              return {};
            },
          },
        },
      },
    ];
  },
}); 