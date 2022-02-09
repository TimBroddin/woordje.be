import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    :root {
        --text-primary-inverse: white;
        --text-keys: black;

        --color-good: var(--nextui-colors-green400);
        --color-bad: var(--nextui-colors-gray600);
        --color-off: var(--nextui-colors-yellow400);
        --color-unknown: var(--nextui-colors-gray300);


        --focus-color: cyan;
        --keyboard-border-color: #666;

        @media (prefers-color-scheme: dark) {
            --text-keys: black;
            --text-primary-inverse: #000;

            --focus-color: rgba(128,128,255,0.8);
            --keyboard-border-color: #999;

        }


        @media (prefers-contrast: more) {
            --color-good: var(--nextui-colors-yellow500);
            --color-off: var(--nextui-colors-blue200);
            
        }
    }

    



    body.colorblind {
        --color-good: var(--nextui-colors-yellow500);
            --color-off: var(--nextui-colors-blue200);     
    }


   
`;

export default GlobalStyle;
