import { Card, Text, Grid, Tooltip } from "@nextui-org/react";
import { NextSeo } from "next-seo";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import { Main, Levels, Level, Note } from "@/components/styled";
import Header from "@/components/Header";
import { useDisplayGameId } from "@/lib/hooks";
import { useTranslations } from "@/lib/i18n";

const GameCard = ({ displayGameId }) => {
  const statistics = useSelector((state) => state.statistics);
  const translations = useTranslations();

  return (
    <Grid xs={12} sm={6} key={`word-${displayGameId}`}>
      <Card>
        <Card.Header>
          <Text key={displayGameId} h1 css={{ fontSize: 16 }}>
            {translations.title} #{displayGameId}
          </Text>
        </Card.Header>
        <Card.Body>
          <Levels>
            {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
              const tries = statistics?.[level]?.[displayGameId];
              const won = tries !== null && tries >= 0;
              const lost = tries === -1;
              const played = won || lost;

              return (
                <Tooltip
                  key={`level-${level}`}
                  content={
                    lost
                      ? "Je verloor dit level."
                      : won
                      ? `Je deed hier ${tries} ${
                          tries === 1 ? "poging" : "pogingen"
                        } over.`
                      : `Je speelde dit level nog niet.`
                  }>
                  <NextLink
                    href={`/archief/${displayGameId}x${level}`}
                    passHref>
                    <Level active={false} won={won} lost={lost}>
                      {level}
                    </Level>
                  </NextLink>
                </Tooltip>
              );
            })}
          </Levels>
        </Card.Body>
      </Card>
    </Grid>
  );
};

const Archive = () => {
  const currentDisplayGameId = useDisplayGameId();
  const translations = useTranslations();

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
        <Header
          showStats={false}
          showInfo={false}
          showHome={true}
          emptyRight={true}
          customTitle="Archief"
        />
        <Note type="primary" css={{ marginBottom: "$8" }}>
          <Text>
            Hier kan je alle vorige spellen opnieuw spelen. Eenmaal gespeeld
            blijft je score onthouden. Het is niet mogelijk om je score nog te
            verbeteren.
          </Text>
        </Note>
        <Grid.Container gap={2}>
          {Array.from({ length: currentDisplayGameId - 1 }, (x, i) => i + 1)
            .reverse()
            .map((gameId) => (
              <GameCard displayGameId={gameId} key={`word-${gameId}`} />
            ))}
        </Grid.Container>
      </Main>
    </>
  );
};

export default Archive;
