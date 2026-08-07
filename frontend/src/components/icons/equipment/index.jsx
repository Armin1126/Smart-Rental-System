import React from 'react';
import { ExcavatorIcon } from './ExcavatorIcon';
import { BulldozerIcon } from './BulldozerIcon';
import { WheelLoaderIcon } from './WheelLoaderIcon';
import { GraderIcon } from './GraderIcon';
import { BackhoeLoaderIcon } from './BackhoeLoaderIcon';
import { CraneIcon } from './CraneIcon';
import { CompactorIcon } from './CompactorIcon';
import { SkidSteerIcon } from './SkidSteerIcon';
import { EngineHoursIcon } from './EngineHoursIcon';
import { DtcFaultIcon } from './DtcFaultIcon';

export {
  ExcavatorIcon,
  BulldozerIcon,
  WheelLoaderIcon,
  GraderIcon,
  BackhoeLoaderIcon,
  CraneIcon,
  CompactorIcon,
  SkidSteerIcon,
  EngineHoursIcon,
  DtcFaultIcon,
};

export const getEquipmentIcon = (type = '', props = {}) => {
  const lower = (type || '').toLowerCase();
  if (lower.includes('excavator')) return <ExcavatorIcon {...props} />;
  if (lower.includes('dozer') || lower.includes('bulldozer')) return <BulldozerIcon {...props} />;
  if (lower.includes('wheel loader') || lower.includes('loader')) return <WheelLoaderIcon {...props} />;
  if (lower.includes('grader')) return <GraderIcon {...props} />;
  if (lower.includes('backhoe')) return <BackhoeLoaderIcon {...props} />;
  if (lower.includes('crane')) return <CraneIcon {...props} />;
  if (lower.includes('compactor') || lower.includes('roller')) return <CompactorIcon {...props} />;
  if (lower.includes('skid steer') || lower.includes('skid')) return <SkidSteerIcon {...props} />;
  return <ExcavatorIcon {...props} />;
};
