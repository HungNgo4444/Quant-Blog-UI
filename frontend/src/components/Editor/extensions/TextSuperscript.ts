import { Mark, mergeAttributes } from '@tiptap/core';

export interface SuperscriptOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    superscript: {
      /**
       * Set a superscript mark
       */
      setSuperscript: () => ReturnType;
      /**
       * Toggle a superscript mark
       */
      toggleSuperscript: () => ReturnType;
      /**
       * Unset a superscript mark
       */
      unsetSuperscript: () => ReturnType;
    };
  }
}

export const TextSuperscript = Mark.create<SuperscriptOptions>({
  name: 'superscript',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'sup',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['sup', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSuperscript:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleSuperscript:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetSuperscript:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-=': () => this.editor.commands.toggleSuperscript(),
    };
  },
}); 