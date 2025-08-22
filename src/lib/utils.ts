import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createUrl(
  pathname: string,
  params: URLSearchParams | Record<string, string>
) {
  const paramsString =
    params instanceof URLSearchParams
      ? params.toString()
      : new URLSearchParams(params).toString();
  return `${pathname}${paramsString.length > 0 ? `?${paramsString}` : ''}`;
}
