import Image from "next/image";

const PoweredByVercel = () => {
  return (
    <div className="px-4">
      <div className="mt-8 ml-8">
        <a
          href="https://vercel.com/?utm_source=Woordje&utm_campaign=oss"
          rel="noreferrer"
          target="_blank"
        >
          <Image
            src="/images/powered-by-vercel.svg"
            alt="Powered by Vercel"
            width={146}
            height={30}
          />
        </a>
      </div>
    </div>
  );
};

export default PoweredByVercel;
