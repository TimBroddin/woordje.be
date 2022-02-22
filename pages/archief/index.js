import { Card, Text, Grid } from "@nextui-org/react";
import { NextSeo } from "next-seo";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import { Main, Levels, Level } from "../../components/styled";
import Header from "../../components/Header";
import { useCorrectedGameId } from "../../lib/hooks";
import { useTranslations } from "../../lib/i18n";

const Archive = () => {
  const currentGameId = useCorrectedGameId();
  const translations = useTranslations();
  const { locale } = useRouter();

  return (
    <>
      <NextSeo
        title={`${translations.title} - Archief`}
        description={`${translations.description}`}
        canonical={translations.url}
        openGraph={{
          url: translations.url,
          title: `${translations.title} - Archief`,
          description: translations.description,
          images: [
            {
              url: `${translations.url}/og.png?v=2`,
              width: 1200,
              height: 630,
              alt: translations.title,
              type: "image/png",
            },
          ],
          site_name: translations.title,
        }}
        twitter={{
          handle: "@timbroddin",
          cardType: "summary",
        }}
      />

      <Main>
        <Header showStats={false} showInfo={false} customTitle="Archief" />
        <Grid.Container gap={2}>
          {Array.from({ length: currentGameId }, (x, i) => i + 1)
            .reverse()
            .map((gameId) => {
              return (
                <Grid xs={12} sm={6} key={`word-${gameId}`}>
                  <Card>
                    <Card.Header>
                      <Text key={gameId} h1 css={{ fontSize: 16 }}>
                        {translations.title} #{gameId}
                      </Text>
                    </Card.Header>
                    <Card.Body>
                      <Levels>
                        {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <NextLink
                            href={`/archief/${gameId}/${level}`}
                            key={`level-${level}`}
                            passHref>
                            <Level active={false}>{level}</Level>
                          </NextLink>
                        ))}
                        {process.env.NEXT_PUBLIC_VRTTAAL === "1" &&
                        locale === "nl-BE" ? (
                          <NextLink
                            href={`/archief/${gameId}/vrttaal`}
                            key={`level-vrttaal`}
                            passHref>
                            <Level wide active={false}>
                              <Image
                                src="/images/vrttaal.svg"
                                width={100}
                                height={48}
                                alt="VRT Taal"
                              />
                            </Level>
                          </NextLink>
                        ) : null}
                      </Levels>
                    </Card.Body>
                  </Card>
                </Grid>
              );
            })}
        </Grid.Container>
      </Main>
    </>
  );
};

export default Archive;
