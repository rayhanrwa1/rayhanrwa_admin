import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Markdown } from 'tiptap-markdown'
import { Bold, Italic, Strikethrough, Code, Heading2, List, ListOrdered, Quote, Table as TableIcon } from 'lucide-react'
import './TipTapEditor.css'

export default function TipTapEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown,
    ],
    content: typeof value === 'string' ? value.replace(/\\n/g, '\n') : value,
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[300px] p-4 text-[15px]',
      },
    },
  })

  if (editor && value !== undefined) {
    const formattedValue = typeof value === 'string' ? value.replace(/\\n/g, '\n') : value;
    const currentContent = editor.storage.markdown.getMarkdown();
    if (currentContent !== formattedValue && currentContent.replace(/\\n/g, '\n') !== formattedValue) {
      // Only update if it's genuinely different to avoid cursor jumping
      editor.commands.setContent(formattedValue, false);
    }
  }

  return (
    <div className="w-full bg-white relative">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center bg-zinc-900 shadow-xl rounded-lg overflow-hidden p-1 border border-zinc-700">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md hover:bg-zinc-700 text-white transition-colors ${editor.isActive('bold') ? 'bg-zinc-700' : ''}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md hover:bg-zinc-700 text-white transition-colors ${editor.isActive('italic') ? 'bg-zinc-700' : ''}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-md hover:bg-zinc-700 text-white transition-colors ${editor.isActive('strike') ? 'bg-zinc-700' : ''}`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-zinc-700 mx-1"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-md hover:bg-zinc-700 text-white transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700' : ''}`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-md hover:bg-zinc-700 text-white transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-700' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-md hover:bg-zinc-700 text-white transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-700' : ''}`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-md hover:bg-zinc-700 text-white transition-colors ${editor.isActive('blockquote') ? 'bg-zinc-700' : ''}`}
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="p-1.5 rounded-md hover:bg-zinc-700 text-white transition-colors"
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      <div className="cursor-text w-full" onClick={() => editor && editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
