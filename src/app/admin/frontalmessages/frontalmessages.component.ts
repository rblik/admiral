import {Component, OnInit} from "@angular/core";
import {FrontalMessage} from "../../model/frontalmessage";
import {AdminFrontalMessagesService} from "../service/admin-frontalmessages.service";

@Component({
  selector: ' frontalmessages',
  templateUrl: './frontalmessages.component.html',
})
export class FrontalMessagesComponent implements OnInit {
  private frontalMessages: FrontalMessage[]
  private createDialog: boolean
  private editedFrontalMessage: FrontalMessage
  private isEdit: boolean;
  private messageColor:string;
  private error:string;

  constructor(private adminFrontalMessagesService: AdminFrontalMessagesService) {
    adminFrontalMessagesService.getAllFrontalMessages().subscribe(messages => {
      this.frontalMessages = messages;
    })
    this.editedFrontalMessage=new FrontalMessage();
    this.editedFrontalMessage.id=null;
    this.editedFrontalMessage.date=Math.floor(Date.now() / 1000);
    this.editedFrontalMessage.color="BLACK";
    this.editedFrontalMessage.header="";
    this.editedFrontalMessage.content="";
  }

  public openModalWindow(frontalMessage:FrontalMessage){
    this.createDialog = true;
    this.cahcheEditedFrontalMessage(frontalMessage);
    this.isEdit=true;
    let frontalMessageFormButton = document.getElementById("frontalMessageFormButton");
    if (!!frontalMessageFormButton) frontalMessageFormButton.click();
  }


  public cahcheEditedFrontalMessage(frontalMessage:FrontalMessage){
    this.editedFrontalMessage=new FrontalMessage();
    this.editedFrontalMessage.id=frontalMessage.id;
    this.editedFrontalMessage.date=frontalMessage.date;
    this.editedFrontalMessage.color=frontalMessage.color;
    this.editedFrontalMessage.header=frontalMessage.header;
    this.editedFrontalMessage.content=frontalMessage.content;
  }

  public saveFrontalMessage(){
    var editedMessage=this.editedFrontalMessage;
    if(editedMessage.content&&editedMessage.header==""){
      this.error = "מלא טקסט";
    }
    else{
    if(editedMessage.id==null){
      this.adminFrontalMessagesService.saveFrontalMessage(editedMessage).subscribe(res=>{
        this.frontalMessages=this.refreshFrontalMessagesAfterAddition(res);
      }, err=> console.log("posterror add"))
    }
    else {
    this.adminFrontalMessagesService.saveFrontalMessage(editedMessage).subscribe(res=>{
   this.frontalMessages=this.refreshFrontalMessagesAfterEditing(res);
    }, err=> console.log("posterror edit"));}
    }

  }

  public initFrontalMessageCreation(){
    this.editedFrontalMessage=new FrontalMessage();
    this.editedFrontalMessage.id=null;
    this.editedFrontalMessage.date=Math.floor(Date.now() / 1000);
    this.editedFrontalMessage.color="BLACK";
    this.editedFrontalMessage.header="";
    this.editedFrontalMessage.content="";
    this.openModalWindow(this.editedFrontalMessage)
  }

  public refreshFrontalMessagesAfterAddition(frontalmessage:FrontalMessage):FrontalMessage[]{
    let frontalMessagesTemp=this.frontalMessages;
    frontalMessagesTemp.push(frontalmessage);
    this.closeModalWindow();
    return frontalMessagesTemp;
  }

  public refreshFrontalMessagesAfterEditing(frontalmessage:FrontalMessage):FrontalMessage[]{
    for (let i = 0; i < this.frontalMessages.length; i++) {
      if (this.frontalMessages[i].id === frontalmessage.id) {
        this.frontalMessages[i]=frontalmessage;
        break;
      }
    }
    this.closeModalWindow();
    return this.frontalMessages;
  }

  public refreshFrontalMessagesAfterRemoving(frontalMessage:FrontalMessage):FrontalMessage[]{
    let frontalMessagesTemp=new Array();

    for(let i = 0; i<this.frontalMessages.length; i++){
      if(this.frontalMessages[i].id!=frontalMessage.id){
        frontalMessagesTemp.push(this.frontalMessages[i]);
      }
    }
    return frontalMessagesTemp;
  }

  public closeModalWindow() {
    this.createDialog = false;
    let frontalMessageFormButton = document.getElementById("frontalMessageFormClose");
    if (!!frontalMessageFormButton) frontalMessageFormButton.click();
  }

  public remove(frontalMessage: FrontalMessage) {
    this.adminFrontalMessagesService.remove(frontalMessage.id).subscribe();
    this.frontalMessages=this.refreshFrontalMessagesAfterRemoving(frontalMessage)
  }

  ngOnInit(): void {

  }

}
