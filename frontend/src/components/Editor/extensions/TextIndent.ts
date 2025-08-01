import { Extension } from '@tiptap/core';

export interface IndentOptions {
  types: string[];
  indentLevels: number[];
  defaultIndentLevel: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      /**
       * Increase indent
       */
      increaseIndent: () => ReturnType;
      /**
       * Decrease indent
       */
      decreaseIndent: () => ReturnType;
      /**
       * Set indent level
       */
      setIndent: (level: number) => ReturnType;
      /**
       * Unset indent
       */
      unsetIndent: () => ReturnType;
    };
  }
}

export const TextIndent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['heading', 'paragraph', 'blockquote', 'listItem'],
      indentLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      defaultIndentLevel: 0,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const textIndent = element.style.textIndent;
              if (textIndent) {
                // Convert px to indent level (assuming 40px per level)
                const pxValue = parseInt(textIndent.replace('px', ''));
                return Math.round(pxValue / 40);
              }
              return 0;
            },
            renderHTML: attributes => {
              if (!attributes.indent || attributes.indent === 0) {
                return {};
              }

              return {
                style: `text-indent: ${attributes.indent * 40}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      increaseIndent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentIndent = node.attrs.indent || 0;
              const maxIndent = this.options.indentLevels.length - 1;
              
              if (currentIndent < maxIndent) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: currentIndent + 1,
                });
              }
            }
          });

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },

      decreaseIndent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentIndent = node.attrs.indent || 0;
              
              if (currentIndent > 0) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: currentIndent - 1,
                });
              }
            }
          });

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },

      setIndent:
        level =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: level,
              });
            }
          });

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },

      unsetIndent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { from, to } = selection;

          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: 0,
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

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.increaseIndent(),
      'Shift-Tab': () => this.editor.commands.decreaseIndent(),
    };
  },
}); 