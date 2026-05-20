import githubMark from '@/assets/GitHub-Mark-32px.png'

export default function Footer() {
  return (
    <footer class="flex justify-center items-center space-x-2 text-xs py-2 bg-gray-100">
      <a
        class="h-4 w-4"
        href="https://github.com/AudioStakes/shortype"
        aria-label="GitHub repository"
      >
        <span class="sr-only">GitHub repository</span>
        <img src={githubMark} alt="" aria-hidden="true" />
      </a>
      <span>© 2022 Daisuke Sato</span>
    </footer>
  )
}
