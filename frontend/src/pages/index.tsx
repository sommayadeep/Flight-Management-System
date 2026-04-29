import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import {
  Navbar,
  HeroSection,
  TransitionSection,
  FlightDashboard,
  FlightTracking,
  Analytics,
  Footer,
} from '@/components';

interface HomeProps {
  framePaths: string[];
}

export async function getStaticProps() {
  const framesDirectory = path.join(process.cwd(), 'public', 'frames');
  const frameFiles = fs
    .readdirSync(framesDirectory)
    .filter((file) => /^frame_.*\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }));

  return {
    props: {
      framePaths: frameFiles,
    },
  };
}

export default function Home({ framePaths }: HomeProps) {
  return (
    <>
      <Head>
        <title>AirControl - Flight Management System</title>
        <meta
          name="description"
          content="Real-time Flight Management System with cinematic scroll animations"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="w-full bg-slate-950 text-slate-100 overflow-x-hidden">
        <Navbar />
        <HeroSection framePaths={framePaths} />
        <TransitionSection />
        <FlightDashboard />
        <FlightTracking />
        <Analytics />
        <Footer />
      </main>
    </>
  );
}
