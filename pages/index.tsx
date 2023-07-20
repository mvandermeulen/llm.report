import OnboardingDashboard from "@/components/OnboardingDashboard";
import FeatureGrid from "@/components/landing/FeatureGrid";
import Hero from "@/components/landing/Hero";
import Testimonials from "@/components/landing/Testimonials";
import { LOCAL_STORAGE_KEY } from "@/lib/constants";
import openai from "@/lib/services/openai";
import useLocalStorage from "@/lib/use-local-storage";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { Callout } from "@tremor/react";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { getTweet, type Tweet } from "react-tweet/api";
import Dashboard from "../components/dashboard";

export default function Home({ tweets }: { tweets: Tweet[] }) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [validKey, setValidKey] = useState(true);

  // useEffect(() => {
  //   if (status !== "loading") {
  //     setLoading(false);
  //   }
  // }, [session]);

  const [key, setKey] = useLocalStorage<string>(LOCAL_STORAGE_KEY, "", true);
  useEffect(() => {
    (async () => setValidKey(await openai.isValidKey(key)))();
  }, [key]);

  return (
    <Suspense fallback={<></>}>
      <>
        {status === "authenticated" && (
          <>
            <Callout
              title="OpenAI API changes"
              icon={ExclamationCircleIcon}
              color="yellow"
            >
              OpenAI has changed their API this morning (July 20, 2023). They no
              longer allow third party apps to access their /api/usage endpoint
              which we use to display this dashboard. We are currently
              investigating workarounds. Sorry for the inconvenience.
            </Callout>
            {(!key || !validKey) && <OnboardingDashboard />}
            {key && validKey && <Dashboard key={key} />}
          </>
        )}
        {status === "unauthenticated" && (
          <>
            <Hero />
            {/* <Dashboard /> */}
            {/* <TrustedBy /> */}
            <FeatureGrid />
            <Testimonials tweets={tweets} />
          </>
        )}
      </>
    </Suspense>
  );
}

const tweetIds = [
  "1654372865222021120",
  // "1653919932516818945",
  "1655703926979825665",
  "1655596207924826117",

  "1659141729151500289",
  "1659218622169096193",
  "1657097533041041424",
  "1654243063651266562",

  "1657165411048210432",
  "1663298747000864769",
  // "1654551137201328128",
  // "1658983912410890241",
  "1658936278690439170",
  "1658970955203641344",
];

export async function getStaticProps() {
  try {
    const tweets = await Promise.all(
      tweetIds.map(async (tweetId) => {
        const tweet = await getTweet(tweetId);
        return tweet;
      })
    );
    return { props: { tweets } };
  } catch (error) {
    return { props: { tweets: [] } };
  }
}
