import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'HomePageWebPartStrings';
import HomePage from './components/HomePage';
import { IHomePageProps } from './components/IHomePageProps';
import { SPHttpClient } from '@microsoft/sp-http';

export interface IHomePageWebPartProps {
  description: string;
}

export default class HomePageWebPart extends BaseClientSideWebPart<IHomePageWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private isSuperAdmin: boolean = false;


  public async onInit(): Promise<void> {
    this._environmentMessage = await this._getEnvironmentMessage();
    await this._checkSuperAdminAccess();
  }

  public render(): void {

    const restrictedPaths = [
      "/_layouts/15/viewlsts.aspx",
      "_layouts/15/viewlsts.aspx?view=14",
      "/_layouts/15/settings.aspx",
      "/_layouts/15/user.aspx",
      "/lists/"
    ];

    const currentUrl = window.location.href.toLowerCase();
    const isRestricted = restrictedPaths.some(path => currentUrl.includes(path));

    if (!this.isSuperAdmin && isRestricted) {
      alert("You don't have permission to access this page.");
      window.location.href = this.context.pageContext.web.absoluteUrl; // redirect to home
      return;
    }
    const element: React.ReactElement<IHomePageProps> = React.createElement(
      HomePage,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        context: this.context,
        SiteURL: this.context.pageContext.web.absoluteUrl,
        UserEmailID: this.context.pageContext.user.email,
        spHttpClient: this.context.spHttpClient,
        userID: this.context.pageContext.legacyPageContext["userId"]
        // peoplePickerContext: {
        //   absoluteUrl: this.context.pageContext.web.absoluteUrl,
        //   msGraphClientFactory: this.context.msGraphClientFactory,
        //   spHttpClient: this.context.spHttpClient
        // }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  // protected onInit(): Promise<void> {
  //   return this._getEnvironmentMessage().then(async message => {
  //     this._environmentMessage = message;
  //     await this._checkSuperAdminAccess();
  //   });
  // }

  private async _checkSuperAdminAccess(): Promise<void> {
    try {
      const context = this.context;
      const userId = context.pageContext.legacyPageContext.userId;
      const superAdminGroup = "SuperAdmin";

      const res = await context.spHttpClient.get(
        `${context.pageContext.web.absoluteUrl}/_api/web/sitegroups/getbyname('${superAdminGroup}')/users?$filter=Id eq ${userId}`,
        SPHttpClient.configurations.v1
      );

      const data = await res.json();
      this.isSuperAdmin = data.value && data.value.length > 0;

      console.log("✅ SuperAdmin:", this.isSuperAdmin);

      // Hide gear/settings if not SuperAdmin
      if (!this.isSuperAdmin) {
        const style = document.createElement("style");
        style.innerHTML = `
          #O365_MainLink_Settings,
          div[data-automationid="SiteActionsButton"],
          button[title="Settings"],
          #O365_MainLink_Help ~ #O365_MainLink_Settings {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }

      const restrictedPaths = [
        "/_layouts/15/viewlsts.aspx",
        "_layouts/15/viewlsts.aspx?view=14",
        "/_layouts/15/settings.aspx",
        "/_layouts/15/user.aspx",
        "/lists/"
      ];

      const currentUrl = window.location.href.toLowerCase();
      const isRestricted = restrictedPaths.some(path => currentUrl.includes(path));

      if (!this.isSuperAdmin && isRestricted) {
        alert("🚫 You don't have permission to access this page.");
        window.location.href = context.pageContext.web.absoluteUrl;
      }

    } catch (err) {
      console.error("Error verifying SuperAdmin access:", err);
    }
  }


  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
