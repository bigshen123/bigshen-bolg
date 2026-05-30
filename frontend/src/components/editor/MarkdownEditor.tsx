import MDEditor from '@uiw/react-md-editor';
import { useThemeContext } from '../theme/ThemeProvider';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    height?: number;
}

/**
 * Markdown 编辑器组件（封装 @uiw/react-md-editor）
 */
const MarkdownEditor = ({ value, onChange, height = 500 }: MarkdownEditorProps) => {
    const { config } = useThemeContext();

    return (
        <div data-color-mode="light" className="rounded-2xl overflow-hidden shadow-sm">
            <MDEditor
                value={value}
                onChange={(val) => onChange(val || '')}
                height={height}
                preview="live"
                visibleDragbar={false}
                style={{
                    borderRadius: '16px',
                    // @ts-expect-error CSS variables for markdown editor
                    '--color-border-default': '#e5e7eb',
                }}
                textareaProps={{
                    placeholder: '开始写你的旅行故事...使用 Markdown 格式',
                }}
            />
        </div>
    );
};

export default MarkdownEditor;
