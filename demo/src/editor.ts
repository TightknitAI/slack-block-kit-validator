import { basicSetup } from "codemirror";
import { json } from "@codemirror/lang-json";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

/**
 * Lightweight theme tuned for the demo. Colors are read from CSS custom
 * properties on `<html>` so light/dark mode are handled by the same instance —
 * we don't need a Compartment swap or a re-mount.
 */
const demoTheme = EditorView.theme({
  "&": {
    color: "var(--text)",
    backgroundColor: "var(--cm-bg)",
    height: "100%",
  },
  ".cm-content": {
    caretColor: "var(--cm-caret)",
    padding: "14px 0",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--cm-caret)",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "var(--cm-gutter-text)",
    border: "none",
    paddingRight: "8px",
  },
  ".cm-activeLineGutter, .cm-activeLine": {
    backgroundColor: "var(--cm-active-bg)",
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "var(--cm-selection-bg)",
  },
  ".cm-line": {
    padding: "0 14px",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--cm-tooltip-bg)",
    border: "1px solid var(--cm-tooltip-border)",
    color: "var(--text)",
  },
});

export interface CreateEditorOptions {
  parent: HTMLElement;
  initialDoc: string;
  onChange: (doc: string) => void;
}

export interface EditorHandle {
  setDoc: (doc: string) => void;
  getDoc: () => string;
  view: EditorView;
}

export function createEditor({ parent, initialDoc, onChange }: CreateEditorOptions): EditorHandle {
  const extensions: Extension[] = [
    basicSetup,
    json(),
    demoTheme,
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    }),
  ];

  const view = new EditorView({
    state: EditorState.create({
      doc: initialDoc,
      extensions,
    }),
    parent,
  });

  return {
    view,
    getDoc: () => view.state.doc.toString(),
    setDoc: (doc: string) => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: doc },
      });
    },
  };
}
