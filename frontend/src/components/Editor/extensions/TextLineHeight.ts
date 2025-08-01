import { Extension } from '@tiptap/core';

export interface LineHeightOptions {
  types: string[];
  values: number[];
  defaultValue: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      /**
       * Set line height
       */
      setLineHeight: (lineHeight: number) => ReturnType;
      /**
       * Unset line height
       */
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const TextLineHeight = Extension.create<LineHeightOptions>({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      values: [1.0, 1.15, 1.5, 2.0, 2.5, 3.0],
      defaultValue: 1.5,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => {
              const lineHeight = element.style.lineHeight;
              return lineHeight ? parseFloat(lineHeight) : null;
            },
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {};
              }

              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        lineHeight =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                lineHeight,
              });
            }
          });

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },
      unsetLineHeight:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                lineHeight: null,
              });
            }
          });

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },
    };
  },
}); 