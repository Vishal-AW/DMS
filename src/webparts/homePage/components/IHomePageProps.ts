import {WebPartContext} from '@microsoft/sp-webpart-base'
export interface IHomePageProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context :WebPartContext;
  SiteURL:string;
  UserEmailID:string;
}
