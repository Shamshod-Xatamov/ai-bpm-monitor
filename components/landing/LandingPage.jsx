import LandingEnhancer from "./LandingEnhancer";

export default function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Asosiy kontentga o'tish
      </a>

      <header className="site-header" data-header>
        <div className="container nav-shell">
          <a
            className="brand"
            href="#top"
            aria-label="AI-BPM Monitor bosh sahifa"
          >
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 42 42" fill="none">
                <path d="M12 11.5h12.5A6.5 6.5 0 0 1 31 18v12.5" />
                <path d="M30 30.5H17.5A6.5 6.5 0 0 1 11 24V11.5" />
                <circle cx="11" cy="11.5" r="3" />
                <circle cx="31" cy="30.5" r="3" />
                <path d="m16.5 21 3 3 6-7" />
              </svg>
            </span>
            <span className="brand-copy">
              <strong>AI-BPM</strong>
              <span>Monitor</span>
            </span>
          </a>

          <nav className="desktop-nav" aria-label="Asosiy navigatsiya">
            <a href="#platforma">Platforma</a>
            <a href="#imkoniyatlar">Imkoniyatlar</a>
            <a href="#natijalar">Natijalar</a>
            <a href="#rollar">Foydalanuvchilar</a>
          </nav>

          <div className="nav-actions">
            <a className="text-link desktop-only" href="#boglanish">
              Bog'lanish
            </a>
            <a
              className="button button--small button--dark desktop-only"
              href="#demo"
            >
              Demo olish
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <path d="M3.75 9h10.5M10 4.75 14.25 9 10 13.25" />
              </svg>
            </a>
            <button
              className="menu-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="mobile-menu"
              aria-label="Menyuni ochish"
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <div className="mobile-menu" id="mobile-menu" hidden>
          <nav aria-label="Mobil navigatsiya">
            <a href="#platforma">Platforma</a>
            <a href="#imkoniyatlar">Imkoniyatlar</a>
            <a href="#natijalar">Natijalar</a>
            <a href="#rollar">Foydalanuvchilar</a>
            <a href="#boglanish">Bog'lanish</a>
          </nav>
          <a className="button button--primary" href="#demo">
            Demo olish
          </a>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-grid" aria-hidden="true"></div>
          <div className="hero-orbit hero-orbit--one" aria-hidden="true"></div>
          <div className="hero-orbit hero-orbit--two" aria-hidden="true"></div>

          <div className="container hero-layout">
            <div className="hero-copy" data-reveal>
              <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                AI asosidagi boshqaruv platformasi
              </div>
              <h1>
                Jarayonlarni shunchaki kuzatmang.
                <span>Ularni oldindan boshqaring.</span>
              </h1>
              <p className="hero-lead">
                AI-BPM Monitor har bir biznes jarayonini real natija, risk va
                iqtisodiy ta'sir bilan bog'laydi — rahbarga esa ayni vaqtda
                qayerga e'tibor berish va qanday qaror qilishni ko'rsatadi.
              </p>

              <div className="hero-actions">
                <a className="button button--primary" href="#demo">
                  Platformani ko'rish
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <path d="M3.75 9h10.5M10 4.75 14.25 9 10 13.25" />
                  </svg>
                </a>
                <a className="play-link" href="#platforma">
                  <span className="play-icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16">
                      <path d="m6 4 5 4-5 4V4Z" />
                    </svg>
                  </span>
                  Qanday ishlaydi
                </a>
              </div>

              <div
                className="hero-proof"
                aria-label="Platformaning asosiy afzalliklari"
              >
                <div className="proof-item">
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <path d="m4 9.25 3 3L14 5.5" />
                  </svg>
                  Qaror uchun aniq xulosa
                </div>
                <div className="proof-item">
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <path d="m4 9.25 3 3L14 5.5" />
                  </svg>
                  Inson nazoratidagi AI
                </div>
              </div>
            </div>

            <div className="hero-visual" data-reveal data-delay="140">
              <div className="dashboard-window">
                <div className="window-sidebar" aria-hidden="true">
                  <div className="mini-brand">
                    <svg viewBox="0 0 32 32" fill="none">
                      <path d="M8 8h9.5A6.5 6.5 0 0 1 24 14.5V24" />
                      <path d="M24 24h-9.5A6.5 6.5 0 0 1 8 17.5V8" />
                    </svg>
                  </div>
                  <div className="sidebar-icons">
                    <span className="active">
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                    </span>
                    <span>
                      <svg viewBox="0 0 20 20">
                        <path d="M4 5h12M4 10h8M4 15h10" />
                      </svg>
                    </span>
                    <span>
                      <svg viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="6" />
                        <path d="M10 7v3.5l2.5 1.5" />
                      </svg>
                    </span>
                    <span>
                      <svg viewBox="0 0 20 20">
                        <path d="M3.5 15.5 8 11l3 2 5.5-7" />
                      </svg>
                    </span>
                  </div>
                  <div className="sidebar-bottom"></div>
                </div>

                <div className="window-content">
                  <div className="window-topbar">
                    <div>
                      <span className="window-kicker">25 avgust, 2026</span>
                      <strong>Boshqaruv markazi</strong>
                    </div>
                    <div className="window-user">
                      <span className="window-search">
                        <svg viewBox="0 0 16 16">
                          <circle cx="7" cy="7" r="4" />
                          <path d="m10.5 10.5 3 3" />
                        </svg>
                      </span>
                      <span className="avatar">AK</span>
                    </div>
                  </div>

                  <div className="metric-grid">
                    <article className="mini-metric mini-metric--featured">
                      <div className="metric-label">
                        <span>Umumiy samaradorlik</span>
                        <i>↗</i>
                      </div>
                      <div className="metric-value">
                        94<span>%</span>
                      </div>
                      <div className="metric-foot">
                        <b>+4.2%</b> o'tgan oyga nisbatan
                      </div>
                      <div className="metric-spark" aria-hidden="true">
                        <span style={{ height: "36%" }}></span>
                        <span style={{ height: "48%" }}></span>
                        <span style={{ height: "44%" }}></span>
                        <span style={{ height: "63%" }}></span>
                        <span style={{ height: "56%" }}></span>
                        <span style={{ height: "78%" }}></span>
                        <span style={{ height: "86%" }}></span>
                      </div>
                    </article>
                    <article className="mini-metric">
                      <div className="metric-icon metric-icon--sage">
                        <svg viewBox="0 0 18 18">
                          <path d="M4 14V8m5 6V4m5 10v-3" />
                        </svg>
                      </div>
                      <span className="metric-caption">Faol jarayonlar</span>
                      <strong>24</strong>
                      <small>
                        <b>+3</b> ushbu oyda
                      </small>
                    </article>
                    <article className="mini-metric">
                      <div className="metric-icon metric-icon--ember">
                        <svg viewBox="0 0 18 18">
                          <path d="M9 3v7M9 14.5v.2" />
                          <circle cx="9" cy="9" r="6.5" />
                        </svg>
                      </div>
                      <span className="metric-caption">Kritik risklar</span>
                      <strong>3</strong>
                      <small>
                        <b className="danger">2 ta yangi</b> signal
                      </small>
                    </article>
                  </div>

                  <div className="dashboard-main-row">
                    <article className="chart-card">
                      <div className="card-heading">
                        <div>
                          <span>Samaradorlik dinamikasi</span>
                          <strong>Jarayonlar natijasi</strong>
                        </div>
                        <button type="button" tabIndex="-1">
                          12 oy <span>⌄</span>
                        </button>
                      </div>
                      <div className="chart-legend">
                        <i></i> Joriy davr <i></i> Reja
                      </div>
                      <div
                        className="line-chart"
                        aria-label="Samaradorlik o'sishini ko'rsatuvchi grafik"
                      >
                        <span className="axis-label axis-label--100">100</span>
                        <span className="axis-label axis-label--75">75</span>
                        <span className="axis-label axis-label--50">50</span>
                        <svg
                          viewBox="0 0 430 155"
                          preserveAspectRatio="none"
                          role="img"
                        >
                          <defs>
                            <linearGradient
                              id="chartFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#dd5f29"
                                stopOpacity=".18"
                              />
                              <stop
                                offset="100%"
                                stopColor="#dd5f29"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            className="chart-plan"
                            d="M10 111 C57 106 70 86 112 91 S170 73 208 81 S266 61 299 69 S356 47 420 43"
                          />
                          <path
                            className="chart-area"
                            d="M10 126 C55 122 74 110 112 104 S169 96 209 86 S263 82 301 60 S359 61 420 25 L420 155 L10 155 Z"
                          />
                          <path
                            className="chart-line"
                            d="M10 126 C55 122 74 110 112 104 S169 96 209 86 S263 82 301 60 S359 61 420 25"
                          />
                          <circle cx="420" cy="25" r="5" />
                        </svg>
                        <div className="chart-tooltip">
                          <b>94%</b>
                          <span>Avgust</span>
                        </div>
                        <div className="chart-months">
                          <span>Sen</span>
                          <span>Noy</span>
                          <span>Yan</span>
                          <span>Mar</span>
                          <span>May</span>
                          <span>Iyul</span>
                          <span>Avg</span>
                        </div>
                      </div>
                    </article>

                    <article className="risk-card">
                      <div className="card-heading">
                        <div>
                          <span>AI Risk Map</span>
                          <strong>Bugungi holat</strong>
                        </div>
                        <span className="live-dot">Live</span>
                      </div>
                      <div
                        className="risk-ring"
                        role="img"
                        aria-label="Risk ko'rsatkichi 28, past daraja"
                      >
                        <svg viewBox="0 0 120 120">
                          <circle
                            className="ring-track"
                            cx="60"
                            cy="60"
                            r="48"
                          />
                          <circle
                            className="ring-value"
                            cx="60"
                            cy="60"
                            r="48"
                          />
                        </svg>
                        <div>
                          <strong>28</strong>
                          <span>Past risk</span>
                        </div>
                      </div>
                      <div className="risk-meta">
                        <span>
                          <i className="risk-low"></i> Normal <b>18</b>
                        </span>
                        <span>
                          <i className="risk-watch"></i> E'tibor <b>3</b>
                        </span>
                      </div>
                    </article>
                  </div>

                  <div className="ai-insight">
                    <span className="ai-insight-icon">
                      <svg viewBox="0 0 22 22">
                        <path d="M11 3.5 12.8 8l4.7 1.8-4.7 1.8-1.8 4.7-1.8-4.7-4.7-1.8L9.2 8 11 3.5Z" />
                        <path d="m16.5 15 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
                      </svg>
                    </span>
                    <div>
                      <span>AI xulosasi</span>
                      <p>
                        <strong>Xaridlarni tasdiqlash</strong> jarayonida 3.4
                        kunlik kechikish ehtimoli aniqlandi.
                      </p>
                    </div>
                    <span className="insight-action">
                      Tavsiyani ko'rish <b>→</b>
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="floating-note floating-note--risk"
                aria-hidden="true"
              >
                <span className="floating-icon">
                  <svg viewBox="0 0 20 20">
                    <path d="M10 3v8M10 15v.2" />
                    <circle cx="10" cy="10" r="7.5" />
                  </svg>
                </span>
                <div>
                  <small>AI signali</small>
                  <strong>Risk 18% kamaydi</strong>
                </div>
              </div>
              <div
                className="floating-note floating-note--saving"
                aria-hidden="true"
              >
                <small>Yillik iqtisodiy samara</small>
                <strong>+410 mln</strong>
                <span>so'm</span>
              </div>
            </div>
          </div>

          <div className="container value-strip" data-reveal>
            <span className="value-strip-label">Bir platformada</span>
            <div className="value-item">
              <svg viewBox="0 0 22 22">
                <path d="M4 15.5V11m5 4.5v-8m5 8v-5m5 5V4" />
              </svg>
              Real-time monitoring
            </div>
            <div className="value-item">
              <svg viewBox="0 0 22 22">
                <path d="M11 3.5 13 8l4.5 2-4.5 2-2 4.5L9 12l-4.5-2L9 8l2-4.5Z" />
              </svg>
              AI prognoz
            </div>
            <div className="value-item">
              <svg viewBox="0 0 22 22">
                <path d="M4 17V9l7-5 7 5v8M8 17v-4h6v4" />
              </svg>
              Iqtisodiy baholash
            </div>
            <div className="value-item">
              <svg viewBox="0 0 22 22">
                <path d="M5 17.5h12M7 14l3-3 2 2 4-5" />
              </svg>
              Qaror tavsiyasi
            </div>
          </div>
        </section>

        <section className="section problem-section" id="platforma">
          <div className="container">
            <div className="section-heading section-heading--split" data-reveal>
              <div>
                <span className="section-index">01 / MUAMMO VA YECHIM</span>
                <h2>
                  Tarqoq ma'lumotlardan
                  <br />
                  <em>yagona haqiqat</em> sari.
                </h2>
              </div>
              <p>
                Hisobotlar kechikadi, muammo esa allaqachon xarajatga aylangan
                bo'ladi. AI-BPM Monitor barcha jarayonlarni bitta boshqaruv
                maydoniga birlashtirib, sodir bo'lgan holatni emas, keyingi eng
                to'g'ri harakatni ko'rsatadi.
              </p>
            </div>

            <div className="problem-grid">
              <article className="problem-card problem-card--old" data-reveal>
                <div className="problem-card-top">
                  <span className="card-tag card-tag--muted">
                    Bugungi holat
                  </span>
                  <span className="card-number">01</span>
                </div>
                <h3>Muammo ko'ringanda, u allaqachon kech bo'ladi.</h3>
                <ul className="friction-list">
                  <li>
                    <span>01</span>Ma'lumotlar Excel va turli tizimlarda tarqoq
                  </li>
                  <li>
                    <span>02</span>Reja va fakt qo'lda solishtiriladi
                  </li>
                  <li>
                    <span>03</span>Risk sababi emas, faqat oqibati ko'rinadi
                  </li>
                  <li>
                    <span>04</span>Qarorlar kechikkan hisobotlarga tayanadi
                  </li>
                </ul>
              </article>

              <article
                className="problem-card problem-card--new"
                data-reveal
                data-delay="120"
              >
                <div className="problem-card-top">
                  <span className="card-tag card-tag--light">AI-BPM bilan</span>
                  <span className="card-number">02</span>
                </div>
                <h3>Muammo xarajatga aylanishidan oldin signal oling.</h3>
                <div className="solution-signal">
                  <div className="solution-signal-head">
                    <span className="signal-pulse"></span>
                    <span>AI prognozi</span>
                    <small>Hozirgina</small>
                  </div>
                  <strong>Xarid jarayoni kechikishi mumkin</strong>
                  <p>78% ehtimol · 3.4 kun · +4.8 mln so'm</p>
                </div>
                <div className="solution-result">
                  <span>Tavsiya etilgan harakat</span>
                  <p>
                    Tasdiqlash bosqichini avtomatik kelishuv oqimiga o'tkazish.
                  </p>
                  <div>
                    <b>−21% vaqt</b>
                    <b>−12% xarajat</b>
                    <b>+16% unumdorlik</b>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section cycle-section" id="imkoniyatlar">
          <div className="container">
            <div
              className="section-heading section-heading--center"
              data-reveal
            >
              <span className="section-index">
                02 / INTELLEKTUAL BOSHQARUV SIKLI
              </span>
              <h2>
                Ma'lumotdan <em>qarorgacha</em> —<br />
                bitta uzluksiz oqim.
              </h2>
              <p>
                Har bir modul keyingisini boyitadi. Natijada tizim kuzatuvchi
                emas, tashkilot bilan birga o'rganadigan boshqaruv mexanizmiga
                aylanadi.
              </p>
            </div>

            <div className="cycle-shell" data-reveal>
              <div className="cycle-line" aria-hidden="true">
                <span></span>
              </div>
              <div className="cycle-steps">
                <button
                  className="cycle-step is-active"
                  type="button"
                  data-cycle="monitoring"
                  aria-pressed="true"
                >
                  <span className="cycle-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 17v-5m5 5V7m5 10v-8m5 8V4" />
                    </svg>
                  </span>
                  <small>01</small>
                  <strong>Monitoring</strong>
                  <em>Jarayon holati</em>
                </button>
                <button
                  className="cycle-step"
                  type="button"
                  data-cycle="analysis"
                  aria-pressed="false"
                >
                  <span className="cycle-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="10.5" cy="10.5" r="6.5" />
                      <path d="m15.5 15.5 4 4M8 11l2 2 3.5-4" />
                    </svg>
                  </span>
                  <small>02</small>
                  <strong>AI tahlil</strong>
                  <em>Anomaliya va sabab</em>
                </button>
                <button
                  className="cycle-step"
                  type="button"
                  data-cycle="forecast"
                  aria-pressed="false"
                >
                  <span className="cycle-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 18 9 13l3 2 7-9M15 6h4v4" />
                    </svg>
                  </span>
                  <small>03</small>
                  <strong>Prognoz</strong>
                  <em>Kelajak natijasi</em>
                </button>
                <button
                  className="cycle-step"
                  type="button"
                  data-cycle="economy"
                  aria-pressed="false"
                >
                  <span className="cycle-icon">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M15 9.5c-.7-.7-1.6-1-2.7-1-1.5 0-2.5.7-2.5 1.8 0 2.7 5.2 1.2 5.2 4 0 1.1-1.1 1.9-2.7 1.9-1.1 0-2.2-.4-3-1.2M12 6.5v11" />
                    </svg>
                  </span>
                  <small>04</small>
                  <strong>Baholash</strong>
                  <em>ROI va iqtisodiy ta'sir</em>
                </button>
                <button
                  className="cycle-step"
                  type="button"
                  data-cycle="decision"
                  aria-pressed="false"
                >
                  <span className="cycle-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="m12 3 2.2 5.5L20 11l-5.8 2.3L12 19l-2.2-5.7L4 11l5.8-2.5L12 3Z" />
                    </svg>
                  </span>
                  <small>05</small>
                  <strong>Tavsiya</strong>
                  <em>Amaliy harakat</em>
                </button>
              </div>
              <div className="cycle-detail" aria-live="polite">
                <div className="cycle-detail-copy">
                  <span data-cycle-label>REAL VAQT MONITORINGI</span>
                  <h3 data-cycle-title>
                    Har bir jarayonning haqiqiy holatini bir ekranda ko'ring.
                  </h3>
                  <p data-cycle-copy>
                    Vaqt, xarajat, ijrochi, KPI va statuslar reja bilan uzluksiz
                    solishtiriladi. Og'ish boshlanishi bilan kerakli rahbar
                    signal oladi.
                  </p>
                </div>
                <div className="cycle-detail-stat">
                  <span data-cycle-stat-label>Ma'lumot yangilanishi</span>
                  <strong data-cycle-stat>Real vaqt</strong>
                  <small data-cycle-stat-note>Jarayon voqealari asosida</small>
                </div>
              </div>
            </div>

            <div className="capability-grid">
              <article
                className="capability-card capability-card--large"
                data-reveal
              >
                <div className="capability-copy">
                  <span className="capability-kicker">
                    AI Risk Intelligence
                  </span>
                  <h3>
                    Riskni ball emas,
                    <br />
                    sabab bilan tushuning.
                  </h3>
                  <p>
                    Kechikish, xarajat, xodim yuklamasi va tarixiy natijalar
                    bitta izohlanadigan Risk Score'ga birlashadi.
                  </p>
                  <a href="#demo">
                    Risk tahlilini ko'rish <span>→</span>
                  </a>
                </div>
                <div
                  className="risk-visual"
                  aria-label="AI risk score vizualizatsiyasi"
                >
                  <div className="risk-score-orbit risk-score-orbit--outer"></div>
                  <div className="risk-score-orbit risk-score-orbit--inner"></div>
                  <div className="risk-score-core">
                    <span>AI Risk Score</span>
                    <strong>68</strong>
                    <small>Yuqori</small>
                  </div>
                  <span className="risk-factor risk-factor--time">
                    <i></i> Vaqt <b>+24%</b>
                  </span>
                  <span className="risk-factor risk-factor--cost">
                    <i></i> Xarajat <b>+11%</b>
                  </span>
                  <span className="risk-factor risk-factor--load">
                    <i></i> Yuklama <b>86%</b>
                  </span>
                </div>
              </article>

              <article
                className="capability-card capability-card--bpei"
                data-reveal
                data-delay="80"
              >
                <span className="capability-kicker">BPEI Efficiency Index</span>
                <h3>
                  Bitta indeks.
                  <br />
                  To'liq samaradorlik.
                </h3>
                <div className="bpei-score">
                  <div className="bpei-ring">
                    <strong>87</strong>
                    <span>/100</span>
                  </div>
                  <div className="bpei-bars">
                    <span>
                      <i style={{ "--value": "91%" }}></i>
                      <b>Vaqt</b>
                      <em>91</em>
                    </span>
                    <span>
                      <i style={{ "--value": "84%" }}></i>
                      <b>Xarajat</b>
                      <em>84</em>
                    </span>
                    <span>
                      <i style={{ "--value": "88%" }}></i>
                      <b>Sifat</b>
                      <em>88</em>
                    </span>
                    <span>
                      <i style={{ "--value": "79%" }}></i>
                      <b>Resurs</b>
                      <em>79</em>
                    </span>
                  </div>
                </div>
                <p>
                  Vaqt, xarajat, sifat, unumdorlik va resurslar 0–100 oralig'ida
                  yagona ilmiy indeksga aylanadi.
                </p>
              </article>

              <article
                className="capability-card capability-card--bottleneck"
                data-reveal
                data-delay="160"
              >
                <span className="capability-kicker">Bottleneck Detection</span>
                <h3>
                  Tor joyni
                  <br />
                  AI o'zi topadi.
                </h3>
                <div className="process-track">
                  <div className="track-line">
                    <span></span>
                  </div>
                  <div className="track-step is-done">
                    <i>✓</i>
                    <span>Qabul</span>
                    <small>12 min</small>
                  </div>
                  <div className="track-step is-done">
                    <i>✓</i>
                    <span>Tekshiruv</span>
                    <small>35 min</small>
                  </div>
                  <div className="track-step is-alert">
                    <i>!</i>
                    <span>Tasdiqlash</span>
                    <small>75 min</small>
                  </div>
                  <div className="track-step">
                    <i>4</i>
                    <span>Yakun</span>
                    <small>17 min</small>
                  </div>
                </div>
                <div className="bottleneck-note">
                  <span>68%</span>
                  <p>
                    Umumiy kechikishning sababi — <b>Tasdiqlash</b> bosqichi.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="impact-section" id="natijalar">
          <div className="impact-pattern" aria-hidden="true"></div>
          <div className="container impact-layout">
            <div className="impact-copy" data-reveal>
              <span className="section-index section-index--light">
                03 / IQTISODIY NATIJA
              </span>
              <h2>
                AI natijasi faqat grafikda emas, <em>biznes qiymatida</em>{" "}
                o'lchanadi.
              </h2>
              <p>
                Har bir optimallashtirish vaqt, xarajat va unumdorlikdagi real
                o'zgarish bilan hisoblanadi. Rahbar investitsiyaning qachon va
                qanday qaytishini ko'radi.
              </p>
              <div className="impact-actions">
                <a className="button button--light" href="#demo">
                  Iqtisodiy modelni ko'rish <span>→</span>
                </a>
                <span className="impact-note">
                  <i>✓</i> Before / After tahlili
                </span>
              </div>
            </div>

            <div className="impact-board" data-reveal data-delay="120">
              <div className="impact-board-head">
                <div>
                  <span>Iqtisodiy samara</span>
                  <strong>Joriy etish natijasi</strong>
                </div>
                <span className="period-pill">2026 yil</span>
              </div>
              <div className="impact-kpis">
                <div className="impact-kpi impact-kpi--main">
                  <span>Yillik samara</span>
                  <strong>
                    <span data-count="410">0</span> mln
                  </strong>
                  <small>so'm</small>
                </div>
                <div className="impact-kpi">
                  <span>ROI</span>
                  <strong>
                    <span data-count="64">0</span>%
                  </strong>
                  <small>investitsiya qaytimi</small>
                </div>
                <div className="impact-kpi">
                  <span>Payback</span>
                  <strong>7.3 oy</strong>
                  <small>qoplanish muddati</small>
                </div>
              </div>
              <div className="comparison-chart">
                <div className="comparison-head">
                  <strong>Oldin / Keyin</strong>
                  <span>
                    <i></i> Oldin <i></i> Keyin
                  </span>
                </div>
                <div className="comparison-row">
                  <span>Jarayon vaqti</span>
                  <div>
                    <i style={{ width: "92%" }}></i>
                    <i style={{ width: "63%" }}></i>
                  </div>
                  <b>−31%</b>
                </div>
                <div className="comparison-row">
                  <span>Operatsion xarajat</span>
                  <div>
                    <i style={{ width: "83%" }}></i>
                    <i style={{ width: "66%" }}></i>
                  </div>
                  <b>−20%</b>
                </div>
                <div className="comparison-row">
                  <span>Xatolik darajasi</span>
                  <div>
                    <i style={{ width: "68%" }}></i>
                    <i style={{ width: "36%" }}></i>
                  </div>
                  <b>−47%</b>
                </div>
                <div className="comparison-row">
                  <span>Unumdorlik</span>
                  <div>
                    <i style={{ width: "58%" }}></i>
                    <i style={{ width: "86%" }}></i>
                  </div>
                  <b>+28%</b>
                </div>
              </div>
              <div className="impact-board-foot">
                <span>
                  <i></i> AI hisob-kitobi yangilandi
                </span>
                <small>Bugun, 10:42</small>
              </div>
            </div>
          </div>

          <div className="container impact-stats" data-reveal>
            <div>
              <strong>
                <span data-count="24">0</span>/7
              </strong>
              <span>uzluksiz monitoring</span>
            </div>
            <div>
              <strong>
                <span data-count="100">0</span>%
              </strong>
              <span>izohlanadigan AI xulosasi</span>
            </div>
            <div>
              <strong>
                <span data-count="6">0</span>
              </strong>
              <span>foydalanuvchi roli</span>
            </div>
            <div>
              <strong>
                <span data-count="15">0</span>+
              </strong>
              <span>asosiy KPI ko'rsatkichi</span>
            </div>
          </div>
        </section>

        <section className="section roles-section" id="rollar">
          <div className="container">
            <div className="section-heading section-heading--split" data-reveal>
              <div>
                <span className="section-index">04 / HAR BIR ROL UCHUN</span>
                <h2>
                  Kerakli insonga
                  <br />
                  <em>kerakli aniqlik.</em>
                </h2>
              </div>
              <p>
                Bir xil ma'lumot, turli qarorlar. Har bir foydalanuvchi ortiqcha
                shovqinsiz, o'z mas'uliyati uchun kerakli ko'rsatkich va
                harakatlarni ko'radi.
              </p>
            </div>

            <div className="role-tabs" data-reveal>
              <div
                className="role-tab-list"
                role="tablist"
                aria-label="Foydalanuvchi rollari"
              >
                <button
                  id="tab-leader"
                  role="tab"
                  aria-selected="true"
                  aria-controls="panel-role"
                  data-role="leader"
                >
                  <span className="role-tab-icon">
                    <svg viewBox="0 0 22 22">
                      <path d="M4 18V9l7-5 7 5v9M8 18v-5h6v5" />
                    </svg>
                  </span>
                  <span>
                    <strong>Rahbar</strong>
                    <small>Strategik qarorlar</small>
                  </span>
                  <i>→</i>
                </button>
                <button
                  id="tab-manager"
                  role="tab"
                  aria-selected="false"
                  aria-controls="panel-role"
                  data-role="manager"
                  tabIndex="-1"
                >
                  <span className="role-tab-icon">
                    <svg viewBox="0 0 22 22">
                      <circle cx="8" cy="8" r="3" />
                      <circle cx="15.5" cy="9" r="2.5" />
                      <path d="M3.5 18c.4-3.4 2-5.3 4.5-5.3s4.1 1.9 4.5 5.3M13 13.5c2.8-.5 4.6 1 5 4.5" />
                    </svg>
                  </span>
                  <span>
                    <strong>Bo'lim boshlig'i</strong>
                    <small>Operatsion nazorat</small>
                  </span>
                  <i>→</i>
                </button>
                <button
                  id="tab-analyst"
                  role="tab"
                  aria-selected="false"
                  aria-controls="panel-role"
                  data-role="analyst"
                  tabIndex="-1"
                >
                  <span className="role-tab-icon">
                    <svg viewBox="0 0 22 22">
                      <path d="M4 17V9m5 8V5m5 12v-4m4 4V7" />
                    </svg>
                  </span>
                  <span>
                    <strong>Analitik</strong>
                    <small>Chuqur tahlil</small>
                  </span>
                  <i>→</i>
                </button>
                <button
                  id="tab-employee"
                  role="tab"
                  aria-selected="false"
                  aria-controls="panel-role"
                  data-role="employee"
                  tabIndex="-1"
                >
                  <span className="role-tab-icon">
                    <svg viewBox="0 0 22 22">
                      <rect x="5" y="3.5" width="12" height="15" rx="2" />
                      <path d="M8 8h6M8 12h6M8 16h3" />
                    </svg>
                  </span>
                  <span>
                    <strong>Xodim</strong>
                    <small>Vazifa va KPI</small>
                  </span>
                  <i>→</i>
                </button>
              </div>

              <div
                className="role-panel"
                id="panel-role"
                role="tabpanel"
                aria-labelledby="tab-leader"
              >
                <div className="role-panel-copy">
                  <span data-role-kicker>EXECUTIVE DECISION SUPPORT</span>
                  <h3 data-role-title>
                    Rahbar muammoni emas, qaror nuqtasini ko'radi.
                  </h3>
                  <p data-role-copy>
                    Tashkilot samaradorligi, kritik risklar, iqtisodiy ta'sir va
                    AI tavsiyalari bitta ixcham boshqaruv ekranida.
                  </p>
                  <ul data-role-list>
                    <li>
                      <i>✓</i> Umumiy samaradorlik va BPEI
                    </li>
                    <li>
                      <i>✓</i> Kritik ogohlantirish va prognozlar
                    </li>
                    <li>
                      <i>✓</i> ROI, iqtisodiy samara va reyting
                    </li>
                  </ul>
                </div>
                <div className="role-ui">
                  <div className="role-ui-top">
                    <span>Rahbar paneli</span>
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>
                  <div className="role-ui-body">
                    <div className="role-summary">
                      <span>Bugungi holat</span>
                      <strong data-role-summary>Barqaror</strong>
                      <small data-role-summary-note>
                        3 ta jarayon e'tibor talab qiladi
                      </small>
                    </div>
                    <div className="role-score">
                      <svg viewBox="0 0 90 90">
                        <circle cx="45" cy="45" r="34" />
                        <circle cx="45" cy="45" r="34" />
                      </svg>
                      <div>
                        <strong data-role-score>87</strong>
                        <span>BPEI</span>
                      </div>
                    </div>
                    <div className="role-alert">
                      <span>!</span>
                      <div>
                        <strong data-role-alert-title>Xarid jarayoni</strong>
                        <small data-role-alert-copy>
                          Kechikish ehtimoli 78%
                        </small>
                      </div>
                      <i>→</i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="trust-bar" data-reveal>
              <div className="trust-copy">
                <span className="trust-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 3.5 19 6v5c0 4.6-2.5 7.8-7 9.5-4.5-1.7-7-4.9-7-9.5V6l7-2.5Z" />
                    <path d="m8.5 12 2.2 2.2 4.8-5" />
                  </svg>
                </span>
                <div>
                  <strong>Ishonch boshidan qurilgan</strong>
                  <p>
                    Role-based access, audit log va inson nazoratidagi AI
                    qarorlari.
                  </p>
                </div>
              </div>
              <div className="trust-points">
                <span>
                  <i>✓</i> RBAC
                </span>
                <span>
                  <i>✓</i> Audit log
                </span>
                <span>
                  <i>✓</i> Explainable AI
                </span>
                <span>
                  <i>✓</i> Secure data
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta" id="demo">
          <div className="cta-ring cta-ring--one" aria-hidden="true"></div>
          <div className="cta-ring cta-ring--two" aria-hidden="true"></div>
          <div className="container final-cta-content" data-reveal>
            <span className="cta-mark" aria-hidden="true">
              <svg viewBox="0 0 44 44">
                <path d="M11 11h12.5A9.5 9.5 0 0 1 33 20.5V33" />
                <path d="M33 33H20.5A9.5 9.5 0 0 1 11 23.5V11" />
                <circle cx="11" cy="11" r="3" />
                <circle cx="33" cy="33" r="3" />
              </svg>
            </span>
            <span className="section-index">05 / KEYINGI QADAM</span>
            <h2>
              Jarayonlaringizni
              <br />
              <em>aniq qarorlarga</em> aylantiring.
            </h2>
            <p>
              AI-BPM Monitor qanday qilib tashkilotingizdagi yashirin risk va
              imkoniyatlarni ko'rsatishini demo orqali ko'ring.
            </p>
            <div className="final-cta-actions">
              <a
                className="button button--dark button--large"
                href="mailto:demo@aibpm.uz?subject=AI-BPM%20Monitor%20demo"
              >
                Demo so'rash
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M3.75 9h10.5M10 4.75 14.25 9 10 13.25" />
                </svg>
              </a>
              <span>Majburiyatsiz · 30 daqiqalik taqdimot</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="boglanish">
        <div className="container footer-main">
          <div className="footer-brand">
            <a className="brand" href="#top">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 42 42" fill="none">
                  <path d="M12 11.5h12.5A6.5 6.5 0 0 1 31 18v12.5" />
                  <path d="M30 30.5H17.5A6.5 6.5 0 0 1 11 24V11.5" />
                  <circle cx="11" cy="11.5" r="3" />
                  <circle cx="31" cy="30.5" r="3" />
                  <path d="m16.5 21 3 3 6-7" />
                </svg>
              </span>
              <span className="brand-copy">
                <strong>AI-BPM</strong>
                <span>Monitor</span>
              </span>
            </a>
            <p>
              Biznes jarayonlarini sun'iy intellekt bilan kuzatish, tushunish va
              yaxshilash platformasi.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Platforma</strong>
              <a href="#platforma">Qanday ishlaydi</a>
              <a href="#imkoniyatlar">Imkoniyatlar</a>
              <a href="#natijalar">Iqtisodiy samara</a>
            </div>
            <div>
              <strong>Yechimlar</strong>
              <a href="#rollar">Rahbarlar uchun</a>
              <a href="#rollar">Analitiklar uchun</a>
              <a href="#rollar">Bo'limlar uchun</a>
            </div>
            <div>
              <strong>Aloqa</strong>
              <a href="mailto:hello@aibpm.uz">hello@aibpm.uz</a>
              <a href="tel:+998712000000">+998 71 200 00 00</a>
              <span>Toshkent, O'zbekiston</span>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © <span data-current-year>2026</span> AI-BPM Monitor. Barcha
            huquqlar himoyalangan.
          </span>
          <div>
            <a href="#">Maxfiylik</a>
            <a href="#">Foydalanish shartlari</a>
          </div>
        </div>
      </footer>
      <LandingEnhancer />
    </>
  );
}
