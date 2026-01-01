import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DocManager_Service, { type Placeholder, type Meta, type PlaceholdersResponse, type LayoutGroup } from "../services/doc_manager_service";

function getDate(offset: number = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split("T")[0];
}
function initialValue(ph: Placeholder) {
    if (ph.type === "date")
        return getDate(ph.offset)
    if (ph.type === "boolean")
        return false;
    if (ph.type === "number")
        return "" as unknown as number;
    if (ph.type === "enum")
        return ph.values?.[0] ?? "";
    return "";
}
function capitalizeFirst(str: string) {
    if (!str)
        return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


interface PlaceholderStringProps {
    ph: Placeholder,
    value: string,
    onChange: (name: string, value: any) => void
}
function Field({ ph, value, onChange }: PlaceholderStringProps) {
    if (ph.type === "enum") {
        return (
            <select
                value={value ?? ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(ph.name, e.target.value)}
                required={!ph.optional}
            >
                {
                    ph.values?.map((value: string | number, valuekey: number) => (
                        <option key={valuekey} value={value}>{value}</option>
                    ))
                }
            </select>
        )
    } else {
        const htmlType =
            ph.type === "number" ? "number" :
                ph.type === "date" ? "date" :
                    ph.type === "boolean" ? "checkbox" :
                        "text";
        const inputProps =
            ph.type === "boolean" ? {
                checked: Boolean(value),
                onChange: ((e: React.ChangeEvent<HTMLInputElement>) => onChange(ph.name, e.target.checked))
            } : {
                value: value,
                onChange: ((e: React.ChangeEvent<HTMLInputElement>) => onChange(ph.name, e.target.value)),
                required: !ph.optional
            }
        return (
            <input
                type={htmlType}
                placeholder={ph.name}
                {...inputProps}
            />
        );
    }
}



function DocManager_Placeholders() {

    const dm_service = new DocManager_Service();

    const { filename, provider } = useParams<{ filename: string, provider: string }>();

    const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
    const [placeholderMap, setPlaceholderMap] = useState<Map<string, Placeholder>>(new Map())
    const [meta, setMeta] = useState<Meta>({});
    const [layout, setLayout] = useState<LayoutGroup[]>([]);
    const [form, setForm] = useState<Record<string, any>>({})

    useEffect(() => {
        (async () => {
            const res: PlaceholdersResponse = await dm_service.getPlaceholders(filename!);
            setPlaceholders(res.placeholders);
            const phMap = new Map();
            res.placeholders.forEach(ph => phMap.set(ph.name, ph));
            setPlaceholderMap(phMap);
            setMeta(res.meta);
            setLayout(res.layout);
            if (res.placeholders)
                setForm(prev => {
                    const next = { ...prev };
                    res.placeholders.forEach(ph => {
                        if (ph.name === "PROVIDER") {
                            if (provider) {
                                next[ph.name] = provider;
                                ph["hidden"] = true;
                            } else {
                                ph["type"] = "enum";
                                ph["values"] = res.meta?.provider;
                            }
                        }
                        if (next[ph.name] === undefined)
                            next[ph.name] = initialValue(ph);
                    });
                    return next;
                })
        })()
    }, [filename]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = { filename, "context": { ...form } }

        placeholders.forEach((ph) => {
            if (ph.type === "date" && typeof payload.context[ph.name] === "string") {
                const [y, m, d] = payload.context[ph.name].split("-");
                payload.context[ph.name] = `${d}.${m}.${y}`
            }
        })
        dm_service.getDoc(filename!, payload.context)
    }

    return (
        <>
            <table>
                <tbody>
                    <tr><td>Creator</td><td>{meta?.creator}</td></tr>
                    <tr><td>Name</td><td>{meta?.name}</td></tr>
                    <tr><td>Version</td><td>{meta?.version}</td></tr>
                    <tr><td>Provider</td><td>{meta?.provider?.join(", ")}</td></tr>
                    <tr><td>Category</td><td>{meta?.category?.join(", ")}</td></tr>
                    <tr><td>Tags</td><td>{meta?.tags?.join(", ")}</td></tr>
                </tbody>
            </table>

            <form onSubmit={handleSubmit}>
                {layout.map((group, groupKey) => (
                    <div key={groupKey}>
                        <h3>{group.group}</h3>
                        {group.rows.map((row, rowKey) => (
                            <div key={rowKey}>
                                {row.map((phName, phKey) => {
                                    const ph = placeholderMap.get(phName);
                                    if (ph)
                                        return (
                                            <label key={phKey}>
                                                {capitalizeFirst(ph.name)}
                                                <Field
                                                    ph={ph}
                                                    value={form[ph.name] ?? ""}
                                                    onChange={(name, value) => setForm(prev => ({ ...prev, [name]: value }))}
                                                ></Field>
                                            </label>
                                        )
                                    return (<></>);
                                })}
                            </div>
                        ))}
                    </div>

                ))}

                <button type="submit">Abschicken</button>
            </form>
        </>
    )
}

export default DocManager_Placeholders;
