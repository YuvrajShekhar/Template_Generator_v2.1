import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DocManager_Service, { type TemplateItem, type TemplateResponse } from "../services/doc_manager_service";


function uniqueSorted(arr: (string | undefined)[]) {
    return Array
        .from(new Set(arr.filter(Boolean) as string[]))
        .sort((a, b) => a.localeCompare(b));
}
function asArray(v?: string | string[] | null) : string[] {
    if(!v) 
        return [];
    return Array.isArray(v) ? v : [v];
}



function DocManager_FileTable() {

    const dm_service = new DocManager_Service();

    const [files, setFiles] = useState<TemplateItem[]>([]);
    const [provider, setProvider] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [tags, setTags] = useState<string>("");


    useEffect(() => {
        (async () => {
            const res: TemplateResponse = await dm_service.getTemplates();
            setFiles(res.files);
        })()
    }, [])

    const providerOptions = useMemo(() => {
        return uniqueSorted(
            files.flatMap((f) => asArray(f.meta?.provider))
        );
    }, [files]);
    const categoryOptions = useMemo(() => {
        return uniqueSorted(
            files.flatMap((f) => asArray(f.meta?.category))
        );
    }, [files]);

    const filtered = useMemo(() => {
        const tagList = tags
            .split(",")
            .map(t => t.trim().toLowerCase())
            .filter(Boolean);

        return files.filter(f => {
            const providers = asArray(f.meta?.provider);
            const categorys = asArray(f.meta?.category);
            const fileTags = asArray(f.meta?.tags).map((t) => t.toLowerCase());

            const okProvider = provider ? providers.includes(provider) : true;
            const okCategory = category ? categorys.includes(category) : true;
            const okTags = tagList.length > 0 ? tagList.every(t => fileTags.some(ft => ft.includes(t))) : true;
            
            return okProvider && okCategory && okTags;
        });
    }, [files, provider, category, tags]);

    return (
        <>
            <label>
                Provider
                <select 
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                >
                    <option value="">(alle)</option>
                    {
                        providerOptions.map(p => (<option key={p} value={p}>{p}</option>))
                    }
                </select>
            </label><br/>
            
            <label>
                Category
                <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    <option value="">(alle)</option>
                    {
                        categoryOptions.map(c => (<option key={c} value={c}>{c}</option>))
                    }
                </select>
            </label><br/>

            <label>
                Tags
                <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                />
            </label>
            <div>
                {filtered.length} / {files.length}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>filename</th>
                        <th>name</th>
                        <th>version</th>
                        <th>creator</th>
                        <th>catecory</th>
                        <th>provider</th>
                        <th>tags</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        filtered.map((file, key) => (
                            <tr key={key}>
                                <td><Link to={`/docManager/${encodeURIComponent(file.filename)}/${encodeURIComponent(provider)}`}>{file.filename}</Link></td>
                                <td>{file.meta?.name}</td>
                                <td>{file.meta?.version}</td>
                                <td>{file.meta?.creator}</td>
                                <td>{file.meta?.category?.join(", ")}</td>
                                <td>{file.meta?.provider?.join(", ")}</td>
                                <td>{file.meta?.tags?.join(", ")}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </>
    )
}

export default DocManager_FileTable;
