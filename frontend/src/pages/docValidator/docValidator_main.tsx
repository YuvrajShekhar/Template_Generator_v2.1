import { useState } from "react";
import DocxDropZone from "../../components/doc_validator_dropZone";
import DocManager_Service from "../../services/doc_manager_service";
import DocValidator_Status from "../../components/doc_validator_status";

function DocValidator_Main() {

    const dm_service = new DocManager_Service();

    const [validateInfo, setValidateInfo] = useState<{} | null>(null);
    
    return (
        <>
            <DocxDropZone onFile={async (file) => {
                const fd = new FormData();
                fd.append("file",file);
                const result = await dm_service.getValidate(fd);
                console.log(result)
                setValidateInfo(result!)
            }} />
            { validateInfo  && (
                <>
                    <DocValidator_Status data={validateInfo} />
                </>
            )}
        </>
        
    )
}

export default DocValidator_Main;
