import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react'
import gsap from 'gsap'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ConfirmModal } from '../components/create/ConfirmModal'
import { ExperienceStep } from '../components/create/ExperienceStep'
import { PeopleStep } from '../components/create/PeopleStep'
import { ReadyStep } from '../components/create/ReadyStep'
import { SetupStep } from '../components/create/SetupStep'
import { TypeStep } from '../components/create/TypeStep'
import { WizardProgress } from '../components/create/WizardProgress'
import { clearUnusedImages } from '../services/localDatabase'
import { useShowBuilderStore } from '../stores/showBuilderStore'
import { useShowSessionStore } from '../stores/showSessionStore'
import type { ExperienceTheme } from '../types/models'
import '../create.css'

const supportedThemes = new Set<ExperienceTheme>(['arcade', 'casino', 'wheel', 'lottery'])

export function CreateShowPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const stepRef = useRef<HTMLDivElement>(null)
  const previousStepRef = useRef(1)
  const appliedThemeRef = useRef(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const store = useShowBuilderStore()
  const startSession = useShowSessionStore((state) => state.startSession)
  const clearSession = useShowSessionStore((state) => state.clearSession)
  const readyTeams = store.teams.filter((team) => team.participants.every((participant) => participant.name.trim())).length
  const peopleValid = store.teams.length >= 2 && readyTeams === store.teams.length
  const setupValid = store.groupCount >= 2 && store.groupCount <= store.teams.length
  const stepValid = [
    false,
    store.randomType === 'teams',
    peopleValid,
    setupValid,
    store.selectedTheme === 'arcade' || store.selectedTheme === 'wheel',
    true,
  ][store.currentStep]

  useEffect(() => {
    if (appliedThemeRef.current) return
    const requestedTheme = searchParams.get('theme') as ExperienceTheme | null
    if (requestedTheme && supportedThemes.has(requestedTheme)) {
      store.setTheme(requestedTheme)
    }
    appliedThemeRef.current = true
  }, [searchParams, store])

  useEffect(() => {
    const participantIds = store.teams.flatMap((team) => team.participants.map((participant) => participant.id))
    void clearUnusedImages(participantIds).catch(() => undefined)
  }, [])

  useLayoutEffect(() => {
    const direction = store.currentStep >= previousStepRef.current ? 1 : -1
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const context = gsap.context(() => {
      gsap.fromTo(
        stepRef.current,
        { opacity: 0, x: reduceMotion ? 0 : 28 * direction },
        { opacity: 1, x: 0, duration: reduceMotion ? 0.15 : 0.4, ease: 'power2.out' },
      )
    })
    previousStepRef.current = store.currentStep
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
    return () => context.revert()
  }, [store.currentStep])

  const goBack = () => store.setStep(Math.max(1, store.currentStep - 1))
  const goNext = () => {
    if (!stepValid) return
    store.setStep(Math.min(5, store.currentStep + 1))
  }

  const clearShow = async () => {
    const participantIds = store.teams.flatMap((team) => team.participants.map((participant) => participant.id))
    store.resetBuilder()
    clearSession()
    await clearUnusedImages(participantIds.filter(() => false))
    setShowClearConfirm(false)
  }

  return (
    <div className="create-page">
      <header className="create-header">
        <Link className="create-logo" to="/" aria-label="Back to RandomShow home"><span>RANDOM</span><strong>SHOW</strong></Link>
        <span className="create-header__mode">Prepare your show</span>
        <div className="save-status"><Check size={13} /> Saved locally</div>
      </header>

      <WizardProgress currentStep={store.currentStep} />

      <main ref={stepRef} className="create-main" key={store.currentStep}>
        {store.currentStep === 1 && <TypeStep selected={store.randomType} onSelect={store.setRandomType} />}
        {store.currentStep === 2 && (
          <PeopleStep
            teams={store.teams}
            onAddTeam={store.addTeam}
            onAddTeams={store.addTeams}
            onLoadDemo={store.loadDemo}
            onReset={() => setShowClearConfirm(true)}
            onRemoveTeam={store.removeTeam}
            onUpdateTeam={store.updateTeam}
            onUpdateParticipant={store.updateParticipant}
          />
        )}
        {store.currentStep === 3 && <SetupStep teams={store.teams} groupCount={store.groupCount} showConfig={store.showConfig} onGroupCountChange={store.setGroupCount} onShowConfigChange={store.setShowConfig} />}
        {store.currentStep === 4 && <ExperienceStep selectedTheme={store.selectedTheme} onSelect={store.setTheme} />}
        {store.currentStep === 5 && <ReadyStep teams={store.teams} groupCount={store.groupCount} selectedTheme={store.selectedTheme} onStart={() => { startSession(store.teams, store.groupCount, store.selectedTheme, store.showConfig); navigate(store.selectedTheme === 'wheel' ? '/show/wheel' : '/show/arcade') }} />}
      </main>

      <div className="wizard-actions">
        <button className="clear-show" type="button" onClick={() => setShowClearConfirm(true)} disabled={store.teams.length === 0}>
          <RotateCcw size={14} /> Reset from start
        </button>
        <div>
          <button type="button" onClick={goBack} disabled={store.currentStep === 1}><ArrowLeft size={16} /> Back</button>
          {store.currentStep < 5 && (
            <button className="continue-button" type="button" onClick={goNext} disabled={!stepValid}>
              Continue <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {showClearConfirm && (
        <ConfirmModal
          title="Reset this show from the beginning?"
          description="This will remove the current setup, reset the wizard to step 1, and clear the active draw."
          confirmLabel="Reset from start"
          danger
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={() => void clearShow()}
        />
      )}
    </div>
  )
}
