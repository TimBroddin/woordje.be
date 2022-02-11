import NextLink from "next/link";
import Image from "next/image";
import styled from "styled-components";
import { usePlausible } from "next-plausible";
import { useSelector, useDispatch } from "react-redux";
import { useTheme as useNextTheme } from "next-themes";
import { Sun, Moon } from "../lib/icons";
import Show from "../lib/iconly/Icons/Show";
import Hide from "../lib/iconly/Icons/Hide";

import { setColorBlind } from "../redux/features/settings";
import { getRandomWord } from "../redux/features/randomWord";
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

const Levels = styled.div`
  margin: 24px 0;
  display: flex;
  flex-wrap: wrap;
`;

const Level = styled.a`
  font-size: 16px;
  background-color: ${(props) =>
    props.$current ? "var(--color-level-active)" : "var(--color-level)"};
  color: white;
  text-decoration: none !important;
  margin: 0 5px 5px 0;
  border-radius: var(--nextui-radii-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.$wide ? "72px" : "36px")};
  height: 36px;
  padding: ${(props) => (props.$wide ? "10px" : "0")};
`;

const Footer = () => {
  const dispatch = useDispatch();
  const { setTheme } = useNextTheme();
  const { isDark, type } = useTheme();

  const randomWord = useSelector((state) => state.randomWord);
  const { gameType } = useSelector((state) => state.settings);
  const colorBlind = useSelector((state) => state.settings?.colorBlind);
  const { WORD_LENGTH } = useSelector((state) => state.settings);
  const plausible = usePlausible();

  return (
    <Container gap={1}>
      <Grid.Container gap={2}>
        <Grid xs={12} sm={6}>
          <Card role="region">
            <Card.Body>
              <Text b>Aantal letters</Text>

              <Levels>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <NextLink
                    href={`/speel/${level}`}
                    key={`level-${level}`}
                    passHref>
                    <Level
                      $current={
                        WORD_LENGTH === level && gameType !== "vrttaal"
                      }>
                      {level}
                    </Level>
                  </NextLink>
                ))}
                {process.env.NEXT_PUBLIC_VRTTAAL ? (
                  <NextLink
                    href={`/speel/vrttaal`}
                    key={`level-vrttaal`}
                    passHref>
                    <Level $current={gameType === "vrttaal"} $wide>
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
                    <Row gap={0}>
                      <Col span={5} css={{ color: "$green600" }}>
                        <Switch
                          checked={colorBlind}
                          aria-label="Hoog contrast"
                          onChange={(e) => dispatch(setColorBlind(!colorBlind))}
                          iconOff={<Hide set="bold" />}
                          iconOn={<Show set="bold" />}
                        />
                      </Col>
                      <Col>
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
                      <Col>
                        <Text>Donkere modus</Text>
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
                Deze Vlaamse versie van Wordle werd gemaakt door{" "}
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
              <Text css={{ fontWeight: "$bold", color: "$white" }}>
                Gebaseerd op{" "}
                <Link
                  css={{ color: "$white", textDecoration: "underline" }}
                  href="https://www.powerlanguage.co.uk/wordle/"
                  rel="noreferrer"
                  target="_blank">
                  Wordle
                </Link>
                .
              </Text>
            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
    </Container>
  );
};

export default Footer;
