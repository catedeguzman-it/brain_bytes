import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ChatInterface from '../components/ChatInterface';
import NavBar from '../components/NavBar';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, []);

  return (
    <>
      <NavBar />
      <ChatInterface />
    </>
  );
}
