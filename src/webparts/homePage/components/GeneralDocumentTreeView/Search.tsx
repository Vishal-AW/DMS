import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import styles from '../GlobalCSS/global.module.scss'; 
import { useEffect } from 'react';


interface ISearchResult {
    Title: string;
    Path: string;
    FileType: string;
    Description?: string;
}

interface ISearchProps {
    context: WebPartContext;
}
useEffect(() => {
    const footerSection = document.querySelector('[data-automation-id="sp-socialbar"]');
    if (footerSection) {
      footerSection.setAttribute("style", "display: none;");
    }
  
   
  }, []);

const SearchComponent: React.FC<ISearchProps> = ({ context }) => {
    const [searchResults, setSearchResults] = React.useState<ISearchResult[]>([]);
    const [searchQuery, setSearchQuery] = React.useState<string>("");

    const libraryPath = `${context.pageContext.web.absoluteUrl}/AWNK`;

    const getSearchResults = async () => {
        if (!searchQuery) return;

        const searchApiUrl = `${context.pageContext.web.absoluteUrl}/_api/search/query?querytext='${searchQuery}'&trimduplicates=false&rowlimit=10&selectproperties='Title,Path,FileType,Description'&refinementfilters='Path:"${libraryPath}"'`;

        try {
            const response = await fetch(searchApiUrl, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "odata-version": "",
                },
            });

            if (!response.ok) throw new Error("Search API request failed");

            const data = await response.json();
            const results = data.PrimaryQueryResult.RelevantResults.Table.Rows.map((row: any) => {
                const cells = row.Cells;
                return {
                    Title: cells.find((c: any) => c.Key === "Title")?.Value || "No Title",
                    Path: cells.find((c: any) => c.Key === "Path")?.Value || "#",
                    FileType: cells.find((c: any) => c.Key === "FileType")?.Value || "Unknown",
                    Description: cells.find((c: any) => c.Key === "Description")?.Value || "No description available",
                };
            });

            setSearchResults(results);
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    return (
        <div>
            <h2>Search Files</h2>
            <input
                type="text"
                placeholder="Enter search term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={getSearchResults}>Search</button>

            <div>
                {searchResults.map((item, index) => (
                    <div key={index} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
                        <a href={item.Path} target="_blank" style={{ fontSize: "16px", fontWeight: "bold" }}>{item.Title}</a>
                        <a href={item.Path} ></a>

                        <p style={{ margin: "5px 0", color: "#555" }}>{item.Description}</p>
                        <span style={{ fontSize: "12px", color: "#777" }}>File Type: {item.FileType}</span>
                    </div>
                ))}
            </div>
            <div className={styles.zo_cf_ada2ac09}>
  {/* This will be hidden */}
</div>
        </div>
    );
    

};

export default SearchComponent;