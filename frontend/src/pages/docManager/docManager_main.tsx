import { useParams } from "react-router-dom";
import DocManager_FileTable from "../../components/doc_manager_fileTable";
import DocManager_Placeholders from "../../components/doc_manager_placeholders";

function DocManager_Main() {
    const {filename} = useParams<{filename:string}>();

    return (
        <>
            <DocManager_FileTable></DocManager_FileTable>
            { filename && (
                <DocManager_Placeholders></DocManager_Placeholders>
            )}
        </>
    )
}

export default DocManager_Main;
