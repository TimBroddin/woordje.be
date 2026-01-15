import { useRemark } from "react-remark";
import { useEffect } from "react";

const Markdown = ({ text }) => {
  const [reactContent, setMarkdownSource] = useRemark({
    rehypeReactOptions: {
      components: {
        a: (props) => (
          <a
            {...props}
            className="text-primary underline hover:text-primary/80"
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.children}
          </a>
        ),
      },
    },
  });

  useEffect(() => {
    setMarkdownSource(text);
  }, [setMarkdownSource, text]);

  return reactContent;
};

export default Markdown;
