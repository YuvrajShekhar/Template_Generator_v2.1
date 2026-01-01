type Issue = {
    severity: "error" | "warn" | "info";
    code: string;
    title?: string;
    message?: string;
    location?: { paragraph?: number; span?: [number, number] };
    hint?: string;
    excerpt?: string;
    params?: Record<string, string>;
};

type ValidateResponse = {
    ok: boolean;
    filename: string;
    issues: Issue[] | { issues?: Issue[] };
    summary?: any;
}

function DocValidator_Status({ data }: { data: ValidateResponse }) {
    if (!data) return null;

    const issuesArray: Issue[] = Array.isArray(data.issues)
        ? data.issues
        : (data.issues as any)?.issues ?? [];

    return (
        <div>
            <div><b>Filename: {data.filename}</b></div>
            <div><b>OK: {data.ok ? 'Yes' : 'No'}</b></div>

            <div>
                Issues ({issuesArray.length}):
                {issuesArray.length === 0 ? (
                    <div>Keine Findings</div>
                ) : (
                    <ul>
                        {issuesArray.map((it, idx) => (
                            <li key={idx}>
                                <div>Severity: {it.severity}</div>
                                <div>Code: {it.code}</div>
                                {it.excerpt && (<div>Excerpt: {it.excerpt}</div>) }
                                {it.title && (<div>Title: {it.title}</div>) }
                                {it.message && (<div>Message: {it.message}</div>) }
                                {it.hint && (<div>Hint: {it.hint}</div>) }
                                {it.location && it.location.paragraph && (<div>Paragraph: {it.location.paragraph }</div>) }
                                {it.location && it.location.span && (<div>Span: {it.location.span[0]}, {it.location.span[1]}</div>) }
                                
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {data.summary && (
                <>
                    <div>Summary:</div>
                    <pre style={{whiteSpace: "pre-wrap"}}>
                        {JSON.stringify(data.summary, null, 2)}
                    </pre>
                </>
            )}
        </div>
    )
}

export default DocValidator_Status;
