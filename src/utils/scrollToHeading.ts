export function scrollToHeading(id: string): boolean {
  const element = document.getElementById(id);

  if (!element) {
    return false;
  }

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });

  return true;
}
