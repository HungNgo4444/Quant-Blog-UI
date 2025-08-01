import { Mark, mergeAttributes } from '@tiptap/core';

export interface SubscriptOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    subscript: {
      /**
       * Set a subscript mark
       */
      setSubscript: () => ReturnType;
      /**
       * Toggle a subscript mark
       */
      toggleSubscript: () => ReturnType;
      /**
       * Unset a subscript mark
       */
      unsetSubscript: () => ReturnType;
    };
  }
}

export const TextSubscript = Mark.create<SubscriptOptions>({
  name: 'subscript',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'sub',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['sub', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSubscript:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleSubscript:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetSubscript:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-,': () => this.editor.commands.toggleSubscript(),
    };
  },
}); 