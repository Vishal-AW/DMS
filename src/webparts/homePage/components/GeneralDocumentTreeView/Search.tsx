import * as React from 'react';
import { TextField, PrimaryButton } from 'office-ui-fabric-react';
import { SPHttpClient } from '@microsoft/sp-http';

interface SearchResult {
    [key: string]: string; // Allows dynamic keys
}

const SearchComponent = (props: { context: any; }) => {
    const [query, setQuery] = React.useState<string>('');
    const [results, setResults] = React.useState<SearchResult[]>([]);

    const handleSearch = async () => {
        if (!query.trim()) {
            alert('Please enter a search term.');
            return;
        }
        const libraryName = 'AWNK';
        const searchUrl = `${props.context.pageContext.web.absoluteUrl}/_api/search/query?querytext='${query} Path:${props.context.pageContext.web.absoluteUrl}/Shared%20Documents/${libraryName}'`;
        //const searchUrl = `${props.context.pageContext.web.absoluteUrl}/_api/search/query?querytext=${query}`;

        try {
            const response = await props.context.spHttpClient.get(
                searchUrl,
                SPHttpClient.configurations.v1
            );

            if (response.ok) {
                const data = await response.json();
                const searchResults = data.PrimaryQueryResult.RelevantResults.Table.Rows.map((row: any) => {
                    const result: SearchResult = {}; // Define as SearchResult
                    row.Cells.forEach((cell: any) => {
                        result[cell.Key] = cell.Value;
                    });
                    return result;
                });
                setResults(searchResults);
            } else {
                console.error('Search request failed: ', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching search results: ', error);
        }
    };

    return (
        <div>
            <TextField
                label="Search"
                placeholder="Enter a keyword..."
                value={query}
                onChange={(e, newValue) => setQuery(newValue || '')}
            />
            <PrimaryButton text="Search" onClick={handleSearch} />
            <div>
                <h3>Results:</h3>
                {results.length > 0 ? (
                    <ul>
                        {results.map((item, index) => (
                            <li key={index}>
                                <strong>{item.Title}</strong> - {item.Path}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No results found.</p>
                )}
            </div>
        </div>
    );
};

export default SearchComponent;
