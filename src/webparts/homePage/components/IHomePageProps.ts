import { WebPartContext } from '@microsoft/sp-webpart-base'
import { SPHttpClient } from '@microsoft/sp-http';
export interface IHomePageProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
  SiteURL: string;
  UserEmailID: string;
  spHttpClient: SPHttpClient;
  userID: number;


}
