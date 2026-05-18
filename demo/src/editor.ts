import { basicSetup } from "codemirror";
import { json } from "@codemirror/lang-json";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

/**
 * Lightweight dark theme tuned for the demo palette. We avoid the
 * one-dark theme dep to keep the bundle small.
 */
const demoTheme = EditorView.theme(
  {
    "&": {
      color: "#e6e8ee",
      backgroundColor: "transparent",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#7aa2ff",
      padding: "14px 0",
    },
    ".cm-cursor": {
      borderLeftColor: "#7aa2ff",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "#4b525e",
      border: "none",
      paddingRight: "8px",
    },
    ".cm-activeLineGutter, .cm-activeLine": {
      backgroundColor: "rgba(91, 141, 239, 0.06)",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(91, 141, 239, 0.25)",
    },
    ".cm-line": {
      padding: "0 14px",
    },
    ".cm-tooltip": {
      backgroundColor: "#1b1e25",
      border: "1px solid #353a45",
      color: "#e6e8ee",
    },
  },
  { dark: true },
);

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
