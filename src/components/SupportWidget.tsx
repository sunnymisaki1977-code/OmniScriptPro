'use client';

import React, { useState, useEffect } from 'react';
import ApplicationModal from './ApplicationModal';
import FeedbackModal from './FeedbackModal';

export default function SupportWidget() {
  const [isAuth, setIsAuth] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAuth(sessionStorage.getItem('os_pro_auth') === 'true');
  }, []);

  if (!mounted) return null;

  return isAuth ? <FeedbackModal /> : <ApplicationModal />;
}
