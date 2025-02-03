import { WebPartContext } from "@microsoft/sp-webpart-base";
import { CreateItem } from "../DAL/Commonfile";

function createSendMailItem(context: WebPartContext, savedata: any) {
    return CreateItem(context.pageContext.web.absoluteUrl, context.spHttpClient, "DMS_SendEmail", savedata);
}

export async function TileSendMail(context: WebPartContext, docinfo: any) {
    let MailBody = "Hello,";
    MailBody += "<br><br>";
    MailBody += docinfo.Msg;
    MailBody += "<br><br>";
    MailBody += "Document Details:";
    //MailBody  += "<br>";
    MailBody += "<br>Document Name : " + docinfo.DocName;
    MailBody += "<br>Uploaded By : " + docinfo.AuthorTitle;
    const subject = docinfo.Sub;
    const Mail = {
        //__metadata: { 'type': 'SP.Data.DMS_x0020_SendEmailListItem' },
        From: context.pageContext.user.email,
        Subject: subject,
        Body: MailBody,
        To: docinfo.To,
        FolderPath: docinfo.FolderPath,
        DocName: docinfo.DocName,

    };
    return await createSendMailItem(context, Mail);
}