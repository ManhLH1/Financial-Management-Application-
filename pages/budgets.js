// Server-side redirect to avoid hydration issues
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/budget-dashboard',
      permanent: false, // 302 redirect (temporary)
    },
  };
}

export default function BudgetsRedirect() {
  // This component will never render due to server-side redirect
  return null;
}
