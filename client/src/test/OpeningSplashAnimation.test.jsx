import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OpeningSplashAnimation from '../components/common/OpeningSplashAnimation.jsx';

describe('OpeningSplashAnimation Component', () => {
  it('renders and invokes onFinish appropriately', () => {
    const onFinishMock = vi.fn();
    render(<OpeningSplashAnimation onFinish={onFinishMock} />);

    // In test environment, it completes cleanly
    expect(onFinishMock).toHaveBeenCalled();
  });
});
