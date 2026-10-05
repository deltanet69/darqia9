import { onMounted, onUnmounted, nextTick } from 'vue'
import { useNuxtApp } from '#app'

export function useGsapReveal() {
  let ctx: any = null

  onMounted(async () => {
    const { $gsap, $ScrollTrigger } = useNuxtApp()
    if (!$gsap) return; // safety check
    // Wait for DOM to be ready
    await nextTick()
    
    // Create a GSAP context for easy cleanup
    ctx = $gsap.context(() => {
      // Elements with .rv class
      const revealElements = $gsap.utils.toArray('.rv, .gsap-rv')
      revealElements.forEach((el: any) => {
        // Disable CSS transitions temporarily to prevent fighting with GSAP
        el.style.transition = 'none'
        
        const delay = el.style.transitionDelay ? parseFloat(el.style.transitionDelay) / 1000 : 0
        
        $gsap.fromTo(el, 
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none none'
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            delay: delay,
            onComplete: () => {
              el.style.transition = '' // Restore if needed, though GSAP handled it
            }
          }
        )
      })

      // Elements with .tl2-item class
      const tlElements = $gsap.utils.toArray('.tl2-item')
      tlElements.forEach((el: any, i) => {
        el.style.transition = 'none'
        $gsap.fromTo(el,
          { opacity: 0, x: -20 },
          {
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'power2.out',
            delay: i * 0.1
          }
        )
      })
      
      // Animate Hero Elements (if any)
      const heroStats = $gsap.utils.toArray('.hstat')
      if (heroStats.length > 0) {
        $gsap.fromTo(heroStats, 
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1, 
            scale: 1, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: 'back.out(1.5)',
            delay: 0.2
          }
        )
      }
      
      // Refresh ScrollTrigger to ensure correct positions after layout shifts
      $ScrollTrigger.refresh()
    })
  })

  onUnmounted(() => {
    if (ctx) {
      ctx.revert() // Cleans up all animations and ScrollTriggers created in this context
    }
  })
}
