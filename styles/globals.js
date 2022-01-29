import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    html {
        --background: #ffffff;
        --text-primary: black;
        --text-secondary: #999;
        --text-tertiary: #666;
        --text-primary-inverse: white;
        --modal-background: #ffffff;


        @media (prefers-color-scheme: dark) {
            --background: #000000;
            --text-primary: #fff;
            --text-secondary: #ccc;
            --text-tertiary: #999;

            --text-primary-inverse: #000;
            --modal-background: #333;

        }
    }


    html,
    body {
    padding: 0;
    margin: 0;
    font-family:  -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
        Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        background-color: var(--background);
    }

    a {
    color: inherit;
    text-decoration: none;
    }

    * {
    box-sizing: border-box;
    }


   
`;

export default GlobalStyle;
