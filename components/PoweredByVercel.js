import { Container, styled } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";

const PoweredBy = styled("div", {
  marginTop: "$8",
  marginLeft: "$8",
});

const PoweredByVercel = () => {
  return (
    <Container gap={1}>
      <PoweredBy>
        <Link
          href="https://vercel.com/?utm_source=Woordje&utm_campaign=oss"
          rel="noreferrer"
          target="_blank">
          <Image
            src={"/images/powered-by-vercel.svg"}
            alt="Powered by Vercel"
            width="146"
            height="30"
          />
        </Link>
      </PoweredBy>
    </Container>
  );
};

export default PoweredByVercel;
