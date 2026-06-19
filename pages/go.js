export default function Go({ url }) {
  return null;
}

export async function getServerSideProps({ query }) {
  const { url } = query;
  
  if (!url) {
    return { redirect: { destination: '/', permanent: false } };
  }

  try {
    const amazonUrl = new URL(decodeURIComponent(url));
    amazonUrl.searchParams.set('tag', 'decisionpilot-20');
    return { redirect: { destination: amazonUrl.toString(), permanent: false } };
  } catch {
    return { redirect: { destination: '/', permanent: false } };
  }
}
