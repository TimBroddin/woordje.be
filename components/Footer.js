import NextLink from "next/link";
import Image from "next/image";
import { usePlausible } from "next-plausible";
import { useSelector, useDispatch } from "react-redux";
import { useTheme as useNextTheme } from "next-themes";
import { useRouter } from "next/router";
import {
  Button,
  Card,
  Col,
  Grid,
  Text,
  Link,
  Container,
  Row,
  Switch,
  Tooltip,
  useTheme,
} from "@nextui-org/react";

import { useTranslations } from "@/lib/i18n";
import { Sun, Moon } from "@/lib/icons";
import Show from "@/lib/iconly/Icons/Show";
import Hide from "@/lib/iconly/Icons/Hide";
import Danger from "@/lib/iconly/Icons/Danger";
import { setColorBlind, setHardMode } from "@/redux/features/settings";
import { getRandomWord } from "@/redux/features/randomWord";
import { Levels, Level } from "@/components/styled";
import { useIsArchive } from "@/lib/hooks";

const Footer = ({ gameId }) => {
  const dispatch = useDispatch();
  const { setTheme } = useNextTheme();
  const { isDark, type } = useTheme();
  const { locale } = useRouter();
  const translations = useTranslations();
  const randomWord = useSelector((state) => state.randomWord);
  const { gameType, colorBlind, hardMode } = useSelector(
    (state) => state.settings
  );
  const { wordLength } = useSelector((state) => state.settings);
  const plausible = usePlausible();
  const isArchive = useIsArchive(gameId);
  return (
    <Container gap={1}>
      <Grid.Container gap={2}>
        <Grid xs={12} sm={6}>
          {!isArchive ? (
            <Card role="region">
              <Card.Header>
                <Text b>Aantal letters</Text>
              </Card.Header>
              <Card.Body>
                <Levels>
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <NextLink
                      href={`/speel/${level}`}
                      key={`level-${level}`}
                      passHref>
                      <Level
                        active={wordLength === level && gameType !== "vrttaal"}>
                        {level}
                      </Level>
                    </NextLink>
                  ))}
                  {process.env.NEXT_PUBLIC_VRTTAAL === "1" &&
                  locale === "nl-BE" ? (
                    <NextLink
                      href={`/speel/vrttaal`}
                      key={`level-vrttaal`}
                      passHref>
                      <Level active={gameType === "vrttaal"} wide>
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
                <NextLink href={"/archief"} passHref>
                  <Button color="gradient" ghost auto as="a">
                    Archief
                  </Button>
                </NextLink>
              </Card.Body>
            </Card>
          ) : (
            <Card role="region">
              <Card.Header>
                <Text b>Ander Woordje?</Text>
              </Card.Header>
              <Card.Body>
                <Text css={{ marginBottom: "$2" }}>
                  Dit is een {translations.title} uit het archief. Een andere
                  spelen?
                </Text>

                <NextLink href={"/"} passHref>
                  <Button
                    color="gradient"
                    ghost
                    auto
                    css={{ margin: "$2" }}
                    as="a">
                    Vandaag
                  </Button>
                </NextLink>
                <NextLink href={"/archief"} passHref>
                  <Button
                    color="gradient"
                    ghost
                    auto
                    css={{ margin: "$2" }}
                    as="a">
                    Archief
                  </Button>
                </NextLink>
              </Card.Body>
            </Card>
          )}
        </Grid>
        <Grid xs={12} sm={6}>
          <Container gap={0}>
            <Row>
              <Card
                role="region"
                clickable
                css={{ marginBottom: "$8" }}
                onClick={(e) => dispatch(getRandomWord())}>
                <Card.Header>
                  <Text b>Willekeurig woord</Text>
                </Card.Header>
                <Card.Body>
                  <Text>{randomWord.value}</Text>
                </Card.Body>
              </Card>
            </Row>
            <Row>
              <Card role="region">
                <Card.Header>
                  <Text b>Instellingen</Text>
                </Card.Header>
                <Card.Body>
                  <Container gap={0}>
                    <Row>
                      <Col span={5} css={{ color: "$green600" }}>
                        <Switch
                          checked={colorBlind}
                          aria-label="Hoog contrast"
                          onChange={(e) => dispatch(setColorBlind(!colorBlind))}
                          iconOff={<Hide set="bold" />}
                          iconOn={<Show set="bold" />}
                        />
                      </Col>
                      <Col css={{ paddingTop: "3px" }}>
                        <Tooltip
                          aria-label="Handig voor kleurenblinden."
                          content="Handig voor kleurenblinden."
                          color="primary">
                          <Text>Hoog contrast</Text>
                        </Tooltip>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={5} css={{ color: "$yellow600" }}>
                        <Switch
                          checked={isDark}
                          onChange={(e) =>
                            setTheme(e.target.checked ? "dark" : "light")
                          }
                          color="warning"
                          iconOn={<Sun filled />}
                          iconOff={<Moon filled />}
                          aria-label="Donkere modus"
                        />
                      </Col>
                      <Col css={{ paddingTop: "3px" }}>
                        <Text>Donkere modus</Text>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={5} css={{ color: "$red500" }}>
                        <Switch
                          checked={hardMode}
                          onChange={(e) => {
                            plausible("HardMode", {
                              props: { value: e.target.checked },
                            });
                            dispatch(setHardMode(e.target.checked));
                          }}
                          color="error"
                          iconOn={<Danger filled />}
                          iconOff={<Danger set="light" />}
                          aria-label="Extra moeilijk"
                        />
                      </Col>
                      <Col css={{ paddingTop: "3px" }}>
                        <Text>
                          <Tooltip
                            color="primary"
                            content={
                              "Geraden letters moeten hergebruikt worden in volgende pogingen."
                            }>
                            Extra moeilijk
                          </Tooltip>
                        </Text>
                      </Col>
                    </Row>
                  </Container>
                </Card.Body>
              </Card>
            </Row>
          </Container>
        </Grid>
        <Grid xs={12}>
          <Card role="region" color="gradient" bordered>
            <Card.Header>
              <Text b css={{ fontWeight: "$bold", color: "$white" }}>
                🤵 Over
              </Text>
            </Card.Header>
            <Card.Body>
              <Text css={{ fontWeight: "$bold", color: "$white" }}>
                Deze {translations.local} versie van{" "}
                <Link
                  css={{ color: "$white", textDecoration: "underline" }}
                  href="https://www.powerlanguage.co.uk/wordle/"
                  rel="noreferrer"
                  target="_blank">
                  Wordle
                </Link>{" "}
                werd gemaakt door{" "}
                <Link
                  css={{ color: "$white", textDecoration: "underline" }}
                  href="https://www.scam.city/"
                  rel="noreferrer"
                  style={{ textDecoration: "underline" }}
                  target="_blank">
                  ScamCity
                </Link>
                /
                <Link
                  css={{ color: "$white", textDecoration: "underline" }}
                  href="https://broddin.be/"
                  style={{ textDecoration: "underline" }}
                  rel="noreferrer"
                  target="_blank">
                  Tim&nbsp;Broddin
                </Link>
                .
              </Text>
            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
      <Text>
        <Text small css={{ margin: "$8", paddingBottom: "$8", color: "$text" }}>
          {translations.alternate_cta} {translations.alternate_flag}{" "}
          <Link
            rel="noreferrer"
            href={translations.alternate_url}
            css={{ color: "$primary" }}>
            {translations.alternate_title}
          </Link>
          .
        </Text>
      </Text>
    </Container>
  );
};

export default Footer;
