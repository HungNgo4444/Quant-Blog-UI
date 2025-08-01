import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface BackgroundColorOptions {
  types: string[];
  colors: string[];
  defaultColor: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    backgroundColor: {
      /**
       * Set background color
       */
      setBackgroundColor: (color: string) => ReturnType;
      /**
       * Unset background color
       */
      unsetBackgroundColor: () => ReturnType;
    };
  }
}

export const TextBackgroundColor = Extension.create<BackgroundColorOptions>({
  name: 'backgroundColor',

  addOptions() {
    return {
      types: ['textStyle'],
      colors: [
        '#ffffff',
        '#ffeb3b',
        '#4caf50',
        '#2196f3',
        '#ff9800',
        '#f44336',
        '#9c27b0',
        '#607d8b',
      ],
      defaultColor: '#ffffff',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: element => element.style.backgroundColor || null,
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {};
              }

              return {
                style: `background-color: ${attributes.backgroundColor}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setBackgroundColor:
        color =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { backgroundColor: color })
            .run();
        },
      unsetBackgroundColor:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { backgroundColor: null })
            .run();
        },
    };
  },
}); 