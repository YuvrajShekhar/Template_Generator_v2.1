export type PlacehoderType = "string" | "number" | "enum" | "date" | "boolean";

// Define your standard categories here
export const STANDARD_CATEGORIES = [
    "Contracts",
    "Invoices", 
    "Reports",
    "Letters",
    "Forms"
] as const;

export interface Placeholder {
    "name": string;
    "type": PlacehoderType;
    "values"?: Array<string | number>;
    "optional"?: boolean;
    "offset"?: number;
    "hidden"?: boolean;
}

export interface Meta {
    "provider"?: string[];
    "category"?: string[];
    "tags"?: string[];
    "version"?: string;
    "creator"?: string;
    "name"?: string;
}

export interface LayoutGroup {
    group: string;
    rows: string[][];
}

export interface TemplateItem {
    "filename": string;
    "meta": Meta;
}
export interface TemplateResponse {
    files: TemplateItem[];
}

export interface PlaceholdersResponse {
    "placeholders": Placeholder[];
    "meta": Meta;
    "layout": LayoutGroup[];
}

class DocManager_Connection {
    private base?: string | undefined;

    constructor(base?: string) {
        // Django API base URL
        this.base = base ?? "http://81.169.171.133:8000/api";
    }

    private async requestJson<T>(path: string, init?: RequestInit): Promise<T> {
        const res = await fetch(`${this.base}${path}`, init);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`${res.status} ${res.statusText} ${text ? ` - ${text}` : ''}`);
        }
        return res.json() as Promise<T>;
    }

    private async requestBlob(path: string, init?: RequestInit): Promise<Blob> {
        const res = await fetch(`${this.base}${path}`, init);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`${res.status} ${res.statusText} ${text ? ` - ${text}` : ''}`);
        }
        return res.blob();
    }

    public async templates(): Promise<TemplateResponse> {
        return this.requestJson<TemplateResponse>('/templates/');
    }

    public async placeholders(
        filename: string
    ): Promise<PlaceholdersResponse> {
        const body = { filename };
        return this.requestJson("/placeholders/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)

        })
    }

    public async generateDoc(
        filename: string,
        context: Record<string, string>
    ) {
        const body = { filename, context };
        const blob = await this.requestBlob("/generateDoc/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)

        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename ?? "output.docx";
        a.click();
        window.URL.revokeObjectURL(url)
    }

    public async validateDoc(fd: FormData) {
        return this.requestJson("/validateDoc/", {
            method: "POST",
            body: fd
        });
    }
}

export default class DocManager_Service {
    private conn = new DocManager_Connection();

    constructor() { }

    public getTemplates(): Promise<TemplateResponse> {
        return this.conn.templates();
    }

    public getPlaceholders(
        filename: string,
    ) {
        return this.conn.placeholders(filename);
    }

    public getDoc(
        filename: string,
        context: Record<string, string>
    ) {
        return this.conn.generateDoc(filename, context);
    }

    public getValidate(fd: FormData) {
        return this.conn.validateDoc(fd);
    }
}
