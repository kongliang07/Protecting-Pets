// ---------- 陪它回家 · script.js ----------

// 表单提交地址（Formspree）：领养申请和志愿者报名分别发到不同的表单，
// 提交后可以登录 formspree.io 查看，或直接看你注册时用的邮箱通知。
const ADOPTION_FORM_ENDPOINT = 'https://formspree.io/f/xyeyqklo';
const VOLUNTEER_FORM_ENDPOINT = 'https://formspree.io/f/mdeorayl';

document.addEventListener('DOMContentLoaded', () => {

  /* 1. 移动端菜单开关 */
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* 2-3. 领养卡片筛选（全部/狗狗/猫咪）+ 分页圆点切换 */
  const filterChips = document.querySelectorAll('.filter-chip');
  const petCards = Array.from(document.querySelectorAll('.pet-card'));
  const petDotsWrap = document.getElementById('petDots');
  const PAGE_SIZE = 4;
  let activeFilter = 'all';
  let currentPage = 0;

  function renderPetView() {
    const filtered = petCards.filter(card => activeFilter === 'all' || card.dataset.species === activeFilter);

    petCards.forEach(card => {
      card.classList.toggle('is-hidden', !filtered.includes(card));
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages - 1) currentPage = 0;

    filtered.forEach((card, i) => {
      const page = Math.floor(i / PAGE_SIZE);
      card.classList.toggle('page-hidden', page !== currentPage);
    });

    petDotsWrap.innerHTML = '';
    if (totalPages > 1) {
      for (let p = 0; p < totalPages; p++) {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `第 ${p + 1} 页`);
        if (p === currentPage) dot.classList.add('active');
        dot.addEventListener('click', () => {
          currentPage = p;
          renderPetView();
          document.getElementById('petGrid')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        petDotsWrap.appendChild(dot);
      }
    }
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      currentPage = 0;
      renderPetView();
    });
  });

  renderPetView();

  /* 4. 救援故事横向滑动 + 左右箭头 */
  const storiesScroll = document.getElementById('storiesScroll');
  const storyPrev = document.getElementById('storyPrev');
  const storyNext = document.getElementById('storyNext');

  const scrollByCard = (direction) => {
    if (!storiesScroll) return;
    const card = storiesScroll.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 20 : 320;
    storiesScroll.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  if (storyPrev) storyPrev.addEventListener('click', () => scrollByCard(-1));
  if (storyNext) storyNext.addEventListener('click', () => scrollByCard(1));

  /* 5. 滚动时高亮当前所在的导航项 */
  const sections = document.querySelectorAll('section[id], div#top');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

  const setActiveLink = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveLink(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(section => observer.observe(section));

  /* 6. 返回顶部按钮 */
  const backToTop = document.getElementById('backToTop');

  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 480);
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* 7. "了解更多" 按钮：打开该宠物的详情弹窗（仅展示信息，不跳转申请） */
  const petDetailModal = document.getElementById('petDetailModal');
  const petDetailImg = document.getElementById('petDetailImg');
  const petDetailName = document.getElementById('petDetailName');
  const petDetailMeta = document.getElementById('petDetailMeta');
  const petDetailBio = document.getElementById('petDetailBio');

  document.querySelectorAll('.pet-more').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.pet-card');
      const name = card.querySelector('.pet-name').childNodes[0].textContent.trim();
      const genderSpan = card.querySelector('.pet-name .m, .pet-name .f');
      const gender = genderSpan ? genderSpan.textContent.trim() : '';
      const meta = card.querySelector('.pet-meta')?.textContent.trim() || '';
      const imgSrc = card.querySelector('.pet-photo img')?.getAttribute('src') || '';
      const bio = card.dataset.bio || '';

      if (petDetailImg) { petDetailImg.src = imgSrc; petDetailImg.alt = name; }
      if (petDetailName) petDetailName.textContent = `${name} ${gender}`;
      if (petDetailMeta) petDetailMeta.textContent = meta;
      if (petDetailBio) petDetailBio.textContent = bio;

      openModal('petDetailModal');
    });
  });

  /* ---------- 弹窗系统 ---------- */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    modal.querySelector('.modal-box')?.classList.remove('is-success');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
    overlay.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(overlay));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(closeModal);
    }
  });

  /* 打开各个入口按钮 */
  const navAdoptBtn = document.getElementById('navAdoptBtn');
  const mobileAdoptBtn = document.getElementById('mobileAdoptBtn');
  const donateBtn = document.getElementById('donateBtn');
  const volunteerBtn = document.getElementById('volunteerBtn');

  if (navAdoptBtn) navAdoptBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('adoptModal'); });
  if (mobileAdoptBtn) mobileAdoptBtn.addEventListener('click', (e) => {
    e.preventDefault();
    mobileMenu?.classList.remove('open');
    menuToggle?.classList.remove('open');
    openModal('adoptModal');
  });
  if (donateBtn) donateBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('donateModal'); });
  if (volunteerBtn) volunteerBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('volunteerModal'); });

  /* 表单提交：领养申请 */
  const adoptForm = document.getElementById('adoptForm');
  const adoptFormError = document.getElementById('adoptFormError');
  const adoptSubmitBtn = document.getElementById('adoptSubmitBtn');
  if (adoptForm) {
    adoptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const petName = document.getElementById('adoptPetSelect').value || '它';
      const payload = {
        petName,
        name: adoptForm.name.value.trim(),
        phone: adoptForm.phone.value.trim(),
        city: adoptForm.city.value.trim(),
        message: adoptForm.message.value.trim(),
      };

      adoptFormError.hidden = true;
      adoptSubmitBtn.disabled = true;
      adoptSubmitBtn.textContent = '提交中…';

      try {
        const res = await fetch(ADOPTION_FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            '意向宠物': payload.petName,
            '申请人姓名': payload.name,
            '电话': payload.phone,
            '居住城市': payload.city,
            '留言': payload.message,
          }),
        });
        if (!res.ok) throw new Error('submit failed');

        document.getElementById('adoptSuccessName').textContent = petName;
        adoptForm.closest('.modal-box').classList.add('is-success');
        adoptForm.reset();
      } catch (err) {
        adoptFormError.textContent = '提交失败，请检查网络连接后再试一次。';
        adoptFormError.hidden = false;
      } finally {
        adoptSubmitBtn.disabled = false;
        adoptSubmitBtn.textContent = '提交申请';
      }
    });
  }

  /* 表单提交：志愿者报名 */
  const volunteerForm = document.getElementById('volunteerForm');
  const volunteerFormError = document.getElementById('volunteerFormError');
  const volunteerSubmitBtn = document.getElementById('volunteerSubmitBtn');
  if (volunteerForm) {
    volunteerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: volunteerForm.name.value.trim(),
        phone: volunteerForm.phone.value.trim(),
        type: volunteerForm.type.value,
        time: volunteerForm.time.value,
        message: volunteerForm.message.value.trim(),
      };

      volunteerFormError.hidden = true;
      volunteerSubmitBtn.disabled = true;
      volunteerSubmitBtn.textContent = '提交中…';

      try {
        const res = await fetch(VOLUNTEER_FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            '姓名': payload.name,
            '电话': payload.phone,
            '感兴趣的类型': payload.type,
            '可服务时间': payload.time,
            '留言': payload.message,
          }),
        });
        if (!res.ok) throw new Error('submit failed');

        volunteerForm.closest('.modal-box').classList.add('is-success');
        volunteerForm.reset();
      } catch (err) {
        volunteerFormError.textContent = '提交失败，请检查网络连接后再试一次。';
        volunteerFormError.hidden = false;
      } finally {
        volunteerSubmitBtn.disabled = false;
        volunteerSubmitBtn.textContent = '提交报名';
      }
    });
  }

  /* 捐赠金额选择 */
  const amountChips = document.querySelectorAll('.amount-chip');
  const customAmountInput = document.getElementById('customAmount');
  const donateAmountLabel = document.getElementById('donateAmountLabel');
  let selectedAmount = 100;

  const updateDonateLabel = () => {
    if (donateAmountLabel) donateAmountLabel.textContent = `¥${selectedAmount || 0}`;
  };

  amountChips.forEach(chip => {
    chip.addEventListener('click', () => {
      amountChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (chip.dataset.amount === 'custom') {
        customAmountInput.style.display = 'block';
        customAmountInput.focus();
        selectedAmount = Number(customAmountInput.value) || 0;
      } else {
        customAmountInput.style.display = 'none';
        selectedAmount = Number(chip.dataset.amount);
      }
      updateDonateLabel();
    });
  });

  if (customAmountInput) {
    customAmountInput.addEventListener('input', () => {
      selectedAmount = Number(customAmountInput.value) || 0;
      updateDonateLabel();
    });
  }

  /* 表单提交：捐赠 */
  const donateForm = document.getElementById('donateForm');
  if (donateForm) {
    donateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('donateSuccessAmount').textContent = `¥${selectedAmount || 0}`;
      donateForm.closest('.modal-box').classList.add('is-success');
      donateForm.reset();
      amountChips.forEach(c => c.classList.remove('active'));
      document.querySelector('.amount-chip[data-amount="100"]')?.classList.add('active');
      customAmountInput.style.display = 'none';
      selectedAmount = 100;
      updateDonateLabel();
    });
  }

  /* 8. 新增按钮：救援报告 / 帮助卡片 / 页脚帮助链接 / 领养·志愿者说明弹窗 */
  const openReportBtn = document.getElementById('openReportBtn');
  const openReportBtnMobile = document.getElementById('openReportBtnMobile');
  const footerReportBtn = document.getElementById('footerReportBtn');
  [openReportBtn, openReportBtnMobile, footerReportBtn].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      mobileMenu?.classList.remove('open');
      menuToggle?.classList.remove('open');
      openModal('reportModal');
    });
  });

  const helpDonateBtn = document.getElementById('helpDonateBtn');
  const helpVolunteerBtn = document.getElementById('helpVolunteerBtn');
  const helpShareBtn = document.getElementById('helpShareBtn');
  if (helpDonateBtn) helpDonateBtn.addEventListener('click', () => openModal('donateModal'));
  if (helpVolunteerBtn) helpVolunteerBtn.addEventListener('click', () => openModal('volunteerModal'));
  if (helpShareBtn) helpShareBtn.addEventListener('click', () => {
    const url = window.location.href;
    const done = () => {
      const original = helpShareBtn.textContent;
      helpShareBtn.textContent = '已复制！✓';
      setTimeout(() => { helpShareBtn.textContent = original; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(done);
    } else {
      done();
    }
  });

  document.querySelectorAll('.help-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const topic = link.dataset.topic;
      const map = { adoptInfo: 'adoptInfoModal', donate: 'donateModal', volunteerInfo: 'volunteerInfoModal', faq: 'faqModal' };
      if (map[topic]) openModal(map[topic]);
    });
  });

  const adoptInfoStartBtn = document.getElementById('adoptInfoStartBtn');
  if (adoptInfoStartBtn) adoptInfoStartBtn.addEventListener('click', () => {
    closeModal(document.getElementById('adoptInfoModal'));
    openModal('adoptModal');
  });

  const volunteerInfoStartBtn = document.getElementById('volunteerInfoStartBtn');
  if (volunteerInfoStartBtn) volunteerInfoStartBtn.addEventListener('click', () => {
    closeModal(document.getElementById('volunteerInfoModal'));
    openModal('volunteerModal');
  });

  /* 9. FAQ 手风琴 */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

});

/* ---------- 按钮点击涟漪动画 ---------- */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

/* ---------- 在线客服聊天窗口（多语言 + 智能关键词回复） ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const chatFab = document.getElementById('chatFab');
  const chatPanel = document.getElementById('chatPanel');
  const chatBody = document.getElementById('chatBody');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatQuick = document.getElementById('chatQuick');
  const chatLang = document.getElementById('chatLang');
  const chatClear = document.getElementById('chatClear');
  const chatMic = document.getElementById('chatMic');
  const chatVoiceRow = document.getElementById('chatVoiceRow');
  const chatVoiceWrap = document.getElementById('chatVoiceWrap');
  const chatVoiceBtn = document.getElementById('chatVoiceBtn');
  const chatVoiceBtnLabel = document.getElementById('chatVoiceBtnLabel');
  const chatVoiceList = document.getElementById('chatVoiceList');
  const chatTitle = document.getElementById('chatTitle');

  if (!chatFab || !chatPanel) return;

  let currentLang = 'zh';

  const UI = {
    zh: { title: '在线客服', status: '通常几分钟内回复', placeholder: '输入你的问题…',
      greeting: '你好呀 👋 我是陪它回家的客服助手，有什么可以帮你的吗？可以直接点下面的问题，或者打字告诉我～',
      quick: { adopt: '领养流程', volunteer: '志愿者报名', donate: '捐赠方式', hours: '工作时间' },
      clearConfirm: '确定要清空这段聊天记录吗？', switched: '已切换为中文，请问有什么可以帮你？' },
    en: { title: 'Live Chat', status: 'Usually replies within minutes', placeholder: 'Type your question…',
      greeting: "Hi there 👋 I'm the Home for Paws assistant. Tap a question below or type your own!",
      quick: { adopt: 'Adoption Process', volunteer: 'Volunteer Signup', donate: 'How to Donate', hours: 'Opening Hours' },
      clearConfirm: 'Clear this chat history?', switched: "Switched to English — how can I help?" },
    ms: { title: 'Sembang Langsung', status: 'Biasanya balas dalam beberapa minit', placeholder: 'Taip soalan anda…',
      greeting: 'Hai 👋 Saya pembantu Home for Paws. Tekan soalan di bawah atau taip soalan anda sendiri!',
      quick: { adopt: 'Proses Mengangkat', volunteer: 'Daftar Sukarelawan', donate: 'Cara Menderma', hours: 'Waktu Operasi' },
      clearConfirm: 'Padam sembang ini?', switched: 'Ditukar ke Bahasa Melayu — ada apa yang boleh saya bantu?' }
  };

  const REPLIES = {
    zh: {
      adopt: ['领养很简单：先在"等待领养"里选一只喜欢的毛孩子，点击"了解更多"填写申请表，我们会安排见面，确认合适后签协议就能接它回家～',
        '想领养的话，去"等待领养"那一栏挑一只合眼缘的，点"了解更多"填申请，之后见个面聊聊，合适就能签协议接回家啦。'],
      volunteer: ['欢迎加入！点击"成为志愿者"按钮，填写联系方式和感兴趣的服务类型，协调员会尽快联系你安排具体工作。',
        '太好了，我们随时欢迎新志愿者～点"成为志愿者"填一下信息，协调员很快会联系你安排合适的岗位。'],
      donate: ['可以点击"立即捐赠"，选择¥20/50/100/200/500 或自定义金额，善款会用于医疗、绝育和日常照护，都有公开报告哦。',
        '点"立即捐赠"就能选金额啦，¥20 到 ¥500 都有，也能自己填数字，每一笔去向都会公开，可以放心。'],
      hours: ['救助站每天 9:00-18:00 开放探访和领养见面，客服在线时间是 9:00-21:00，其他时间留言我们也会尽快回复～',
        '我们 9 点到 6 点开放探访，客服一直忙到晚上 9 点，超过这个时间留言也别担心，看到都会回你。'],
      location: '我们在北京市朝阳区某某路 123 号，具体地址和路线可以在页面底部"联系我们"里找到。',
      contact: '可以拨打 011-2182 9419，或发邮件到 shubaizhiyuan@gmail.com，工作时间内我们都会尽快回复。',
      about: '陪它回家是一个从 2016 年开始的独立动物保护组织，专注救助流浪猫狗，累计已经帮助 128 只动物找到出路。',
      identity: ['我是"陪它回家"的客服助手，虽然是自动回复，但会尽力帮你把常见问题解答清楚，有更复杂的事人工客服也会跟进～',
        '我是网站里的客服小助手啦，专门回答领养、志愿者、捐款这些问题，有解决不了的会转交给真人同事。'],
      lost: '如果你捡到走失的动物，可以直接把地点和情况告诉我，志愿者会尽快评估并安排救助，也可以拨打客服电话求助。',
      medical: '如果动物生病或受伤比较紧急，建议先联系附近的宠物医院处理，同时告诉我们情况，我们会看能否协助医疗费用或转介合作诊所。',
      report: '可以点击导航栏的"救援报告"查看我们的救助数据和善款使用比例，每一笔支出我们都会公开。',
      help: '想帮助我们的话，可以捐款、当志愿者，或者帮忙转发领养信息，页面上"如何帮助"那一栏都有具体入口。',
      thanks: ['不客气呀，谢谢你愿意关心流浪动物 🐾 还有其他问题都可以问我。',
        '别客气～能有人关心这些毛孩子，我们已经很开心了，有别的问题随时问。'],
      greeting: ['你好呀！有什么想了解的都可以问我～', '嗨～欢迎来陪它回家，有什么我可以帮忙的吗？'],
      farewell: ['好的，祝你今天顺利，也谢谢你关心流浪动物 🐾 有需要随时回来找我。',
        '拜拜啦～欢迎常来看看毛孩子们，有问题随时找我。'],
      default: ['这个问题我先记下来啦，客服人员会尽快跟进，也可以直接拨打 011-2182 9419 找我们～',
        '嗯，这个问题有点具体，我先转给人工同事看看，你也可以拨打 011-2182 9419 直接聊。']
    },
    en: {
      adopt: ['It\'s simple: pick a pet under "Waiting for a Home", fill in the adoption form, we\'ll arrange a meet-up, then sign the agreement and take them home.',
        'Just browse "Waiting for a Home", tap "Learn More" on the one you like, fill the form, and after a meet-up you can sign and bring them home.'],
      volunteer: ['Awesome! Tap "Become a Volunteer", tell us your contact info and what you\'re interested in, and our coordinator will follow up soon.',
        'We\'d love to have you! Fill in the volunteer form with your info and interests, and our coordinator will reach out shortly.'],
      donate: ['Tap "Donate Now" and choose ¥20/50/100/200/500 or a custom amount — every donation goes to medical care, sterilization and daily care, fully reported.',
        'Just hit "Donate Now" — pick a preset amount or type your own, and it all goes toward medical care and daily upkeep, openly reported.'],
      hours: ['Our shelter is open for visits 9:00-18:00 daily. Live chat is staffed 9:00-21:00; messages outside those hours get a reply as soon as we\'re back.',
        'Visits run 9am-6pm every day, and live chat is staffed until 9pm — anything after that still gets a reply the next morning.'],
      location: 'We\'re located at No. 123 Somewhere Road, Chaoyang District, Beijing — full details are in the "Contact Us" section at the bottom of the page.',
      contact: 'You can call 011-2182 9419 or email shubaizhiyuan@gmail.com — we reply as quickly as we can during working hours.',
      about: 'Home for Paws is an independent animal rescue that started in 2016, focused on stray cats and dogs — we\'ve helped 128 animals so far.',
      identity: ['I\'m the Home for Paws chat assistant — an automated helper, but I\'ll do my best with common questions. Anything trickier gets passed to our human team.',
        'Just the site\'s chat assistant here! I handle the common questions — adoption, volunteering, donations — and hand off anything more complex.'],
      lost: 'If you\'ve found a stray, just tell me the location and condition — a volunteer will assess and help, or you can call our hotline directly.',
      medical: 'For urgent injuries, please get the animal to a nearby vet first, then let us know — we may be able to help with costs or refer you to a partner clinic.',
      report: 'Check the "Rescue Report" in the navigation bar for our rescue numbers and how donations are spent — everything is published openly.',
      help: 'You can donate, volunteer, or simply share our adoption posts — see the "How to Help" section on the page for direct links.',
      thanks: ["You're very welcome — thank you for caring about strays 🐾 Feel free to ask anything else.",
        "No problem at all — it means a lot that you care. Ask away if anything else comes to mind."],
      greeting: ["Hi! What would you like to know?", "Hey there! How can I help today?"],
      farewell: ["Take care, and thank you for caring about strays 🐾 Come back anytime.",
        "Bye for now — feel free to drop by again if you have more questions."],
      default: ["Got it, I've noted your question — our team will follow up soon, or you can call 011-2182 9419 directly.",
        "That's a bit specific — I've passed it to our team, or you're welcome to call 011-2182 9419 directly."]
    },
    ms: {
      adopt: ['Mudah je: pilih haiwan di bawah "Menunggu Rumah", isi borang permohonan, kami akan aturkan sesi jumpa, kemudian tandatangan perjanjian dan bawa balik.',
        'Cuma pilih haiwan di "Menunggu Rumah", tekan "Ketahui Lebih Lanjut", isi borang, lepas sesi jumpa boleh tandatangan dan bawa balik.'],
      volunteer: ['Bagus! Tekan "Jadi Sukarelawan", berikan maklumat hubungan dan minat anda, penyelaras kami akan hubungi anda tidak lama lagi.',
        'Kami mengalu-alukan anda! Isi borang sukarelawan dengan maklumat dan minat anda, penyelaras akan hubungi anda tidak lama lagi.'],
      donate: ['Tekan "Derma Sekarang" dan pilih ¥20/50/100/200/500 atau jumlah sendiri — setiap derma digunakan untuk rawatan, pemandulan dan penjagaan harian, dilaporkan secara telus.',
        'Tekan sahaja "Derma Sekarang" — pilih jumlah pratetap atau masukkan sendiri, semuanya untuk rawatan dan penjagaan harian, dilaporkan secara terbuka.'],
      hours: ['Pusat jagaan kami dibuka untuk lawatan 9:00-18:00 setiap hari. Sembang langsung beroperasi 9:00-21:00, mesej di luar waktu itu akan dibalas secepat mungkin.',
        'Lawatan dibuka 9 pagi hingga 6 petang setiap hari, sembang langsung sampai 9 malam — mesej selepas itu tetap akan dibalas.'],
      location: 'Kami terletak di No. 123 Jalan Contoh, Daerah Chaoyang, Beijing — butiran penuh ada di bahagian "Hubungi Kami" di bawah laman.',
      contact: 'Anda boleh hubungi 011-2182 9419 atau emel shubaizhiyuan@gmail.com, kami akan balas secepat mungkin dalam waktu bekerja.',
      about: 'Home for Paws ialah pertubuhan penyelamatan haiwan bebas yang bermula pada 2016, fokus kepada kucing dan anjing terbiar — sudah membantu 128 ekor haiwan setakat ini.',
      identity: ['Saya pembantu sembang Home for Paws — pembantu automatik, tetapi saya cuba jawab soalan lazim sebaik mungkin. Soalan yang lebih rumit akan diserahkan kepada pasukan kami.',
        'Saya cuma pembantu sembang laman ini! Saya uruskan soalan biasa — pengangkatan, sukarelawan, derma — dan serahkan yang lebih rumit kepada pasukan.'],
      lost: 'Jika anda jumpa haiwan terbiar, beritahu saya lokasi dan keadaannya — sukarelawan akan menilai dan membantu, atau anda boleh terus hubungi talian kami.',
      medical: 'Untuk kecederaan yang mendesak, sila bawa haiwan ke klinik veterinar terdekat dahulu, kemudian maklumkan kami — kami mungkin boleh bantu kos atau rujuk ke klinik rakan kongsi.',
      report: 'Semak "Laporan Penyelamatan" pada bar navigasi untuk lihat data penyelamatan dan penggunaan derma — semuanya diterbitkan secara terbuka.',
      help: 'Anda boleh menderma, jadi sukarelawan, atau kongsikan post pengangkatan kami — lihat bahagian "Cara Membantu" pada laman untuk pautan terus.',
      thanks: ['Sama-sama — terima kasih kerana prihatin terhadap haiwan terbiar 🐾 Boleh tanya apa-apa lagi.',
        'Sama-sama, ia bermakna buat kami anda prihatin. Tanya sahaja jika ada apa-apa lagi.'],
      greeting: ['Hai! Apa yang anda ingin tahu?', 'Hai! Apa yang boleh saya bantu hari ini?'],
      farewell: ['Jaga diri, dan terima kasih kerana prihatin terhadap haiwan terbiar 🐾 Datang lagi bila-bila masa.',
        'Bye dulu — datang lagi jika ada soalan lain nanti.'],
      default: ['Baik, soalan anda sudah dicatat — pasukan kami akan susulan tidak lama lagi, atau terus hubungi 011-2182 9419.',
        'Soalan itu agak khusus — saya sudah catat untuk pasukan kami, atau anda boleh terus hubungi 011-2182 9419.']
    }
  };

  function pickReply(lang, topic) {
    const entry = (REPLIES[lang] && REPLIES[lang][topic]) || REPLIES[lang].default;
    return Array.isArray(entry) ? entry[Math.floor(Math.random() * entry.length)] : entry;
  }

  const KEYWORDS = {
    adopt: ['领养','认养','adopt','adoption','angkat','mengangkat'],
    volunteer: ['志愿者','义工','volunteer','sukarelawan','relawan'],
    donate: ['捐','捐赠','捐款','donate','donation','derma','sumbangan'],
    hours: ['时间','几点','开放','营业','hours','open','waktu','bila'],
    location: ['地址','在哪','位置','怎么走','address','location','lokasi','alamat'],
    contact: ['电话','联系','联系方式','邮箱','contact','phone','email','hubungi','telefon'],
    identity: ['你是谁','你是机器人','你是人吗','who are you','are you a bot','are you human','siapa awak','awak bot ke'],
    about: ['你们是','介绍','关于你们','是什么组织','about','who are you','apa itu'],
    lost: ['走失','丢了','跑丢','捡到','lost pet','missing','found a','hilang','jumpa'],
    medical: ['生病','受伤','医疗','看病','sick','injured','medical','sakit','cedera'],
    report: ['报告','透明','善款去向','report','laporan'],
    help: ['如何帮助','怎么帮','帮忙','help','bantuan'],
    thanks: ['谢谢','感谢','thank','thanks','terima kasih'],
    farewell: ['再见','拜拜','goodbye','bye','see you','selamat tinggal','jumpa lagi'],
    greeting: ['你好','嗨','您好','hi','hello','hey','hai','helo']
  };

  function detectTopic(text) {
    const lower = text.toLowerCase();
    for (const topic in KEYWORDS) {
      if (KEYWORDS[topic].some(k => lower.includes(k.toLowerCase()))) return topic;
    }
    return 'default';
  }

  const SPEECH_LANG = { zh: 'zh-CN', en: 'en-US', ms: 'ms-MY' };
  const VOICE_NAME_HINTS = {
    zh: ['chinese', 'mandarin', '中文', '普通话', 'zh-'],
    ms: ['melayu', 'malay', 'bahasa', 'ms-', 'ms_'],
    en: ['english', 'en-', 'en_'],
  };
  let availableVoices = [];
  let selectedVoiceURI = '';
  let voicesReady = false;

  function langPrefix(lang) {
    return (SPEECH_LANG[lang] || 'zh-CN').split('-')[0];
  }

  // 手机（尤其 iOS）经常要等一下、或者要等用户碰过屏幕之后，
  // getVoices() 才会真的返回语音列表，所以这里做几次重试，而不是只问一次。
  function loadVoicesWithRetry(attempt = 0) {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      availableVoices = voices;
      voicesReady = true;
      populateVoiceList();
    } else if (attempt < 10) {
      setTimeout(() => loadVoicesWithRetry(attempt + 1), 300);
    }
  }

  function findVoicesForLang(lang) {
    const prefix = langPrefix(lang);
    const hints = VOICE_NAME_HINTS[lang] || [];
    // 1) 精确语言代码匹配（比如 zh-CN）
    let matches = availableVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
    // 2) 语言代码匹配不到，就用语音名称里的关键词再找一次
    //    （有些安卓机器语言代码标得不规范，但名字里会写 "Chinese"/"Melayu" 之类）
    if (!matches.length && hints.length) {
      matches = availableVoices.filter(v =>
        hints.some(h => (v.name || '').toLowerCase().includes(h) || (v.lang || '').toLowerCase().includes(h))
      );
    }
    return matches;
  }

  function populateVoiceList() {
    if (!('speechSynthesis' in window) || !chatVoiceList) return;
    if (!availableVoices.length) {
      availableVoices = window.speechSynthesis.getVoices();
    }
    if (!availableVoices.length) return;

    let matches = findVoicesForLang(currentLang);
    const noteEl = document.getElementById('chatVoiceNote');

    if (!matches.length) {
      // 这台设备真的没有这个语言的语音包，列出所有能用的声音，并提示一下原因
      matches = availableVoices;
      if (noteEl) {
        const msg = {
          zh: '这台设备还没有安装华语语音包，下面先列出其他可用的声音；可以到手机「设置」里下载华语语音包。',
          ms: '这台设备还没有安装国语（Bahasa Melayu）语音包，下面先列出其他可用的声音。',
          en: 'This device has no English voice installed — showing other available voices instead.',
        }[currentLang] || '';
        if (msg) {
          noteEl.textContent = msg;
          noteEl.hidden = false;
        }
      }
    } else if (noteEl) {
      noteEl.hidden = true;
    }

    chatVoiceList.innerHTML = '';
    matches.forEach((voice, i) => {
      const li = document.createElement('li');
      li.textContent = `${voice.name}${voice.lang ? ' · ' + voice.lang : ''}`;
      li.setAttribute('role', 'option');
      li.dataset.uri = voice.voiceURI;
      if (i === 0) {
        li.classList.add('selected');
        selectedVoiceURI = voice.voiceURI;
        if (chatVoiceBtnLabel) chatVoiceBtnLabel.textContent = voice.name;
      }
      li.addEventListener('click', () => {
        selectedVoiceURI = voice.voiceURI;
        if (chatVoiceBtnLabel) chatVoiceBtnLabel.textContent = voice.name;
        chatVoiceList.querySelectorAll('li').forEach(x => x.classList.remove('selected'));
        li.classList.add('selected');
        closeVoiceDropdown();
      });
      chatVoiceList.appendChild(li);
    });
  }

  function openVoiceDropdown() {
    chatVoiceWrap?.classList.add('open');
    chatVoiceBtn?.setAttribute('aria-expanded', 'true');
  }
  function closeVoiceDropdown() {
    chatVoiceWrap?.classList.remove('open');
    chatVoiceBtn?.setAttribute('aria-expanded', 'false');
  }

  let speechUnlocked = false;

  // iOS 需要在用户第一次点击/触摸之后，才允许网页真正播放语音，
  // 这里在用户第一次点开客服窗口时，先用一个几乎无声的短句"解锁"一下，
  // 后面正常点朗读按钮时才不会没有声音。
  function unlockSpeechOnce() {
    if (speechUnlocked || !('speechSynthesis' in window)) return;
    speechUnlocked = true;
    try {
      const primer = new SpeechSynthesisUtterance(' ');
      primer.volume = 0;
      window.speechSynthesis.speak(primer);
    } catch (err) { /* 忽略，不影响其他功能 */ }
  }

  function speakText(text, btn) {
    if (!('speechSynthesis' in window)) return;

    const doSpeak = () => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = SPEECH_LANG[currentLang] || 'zh-CN';
      const chosenVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (chosenVoice) {
        utter.voice = chosenVoice;
        utter.lang = chosenVoice.lang || utter.lang;
      }
      if (btn) {
        btn.classList.add('speaking');
        utter.onend = () => btn.classList.remove('speaking');
        utter.onerror = () => btn.classList.remove('speaking');
      }
      window.speechSynthesis.speak(utter);
    };

    window.speechSynthesis.cancel();
    // 安卓 Chrome 有个已知小毛病：cancel() 之后马上 speak()，声音有时会直接被吞掉，
    // 隔一点点时间再说话就稳定很多。
    setTimeout(doSpeak, 60);
  }

  function scrollChatToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addMessage(text, from) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${from}`;

    const textSpan = document.createElement('span');
    textSpan.className = 'msg-text';
    textSpan.textContent = text;
    msg.appendChild(textSpan);

    if (from === 'bot' && 'speechSynthesis' in window) {
      const speakBtn = document.createElement('button');
      speakBtn.type = 'button';
      speakBtn.className = 'msg-speak';
      speakBtn.setAttribute('aria-label', '朗读这条消息');
      speakBtn.innerHTML =
        '<span class="ms-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M11 5L6 9H2v6h4l5 4V5z"></path>' +
        '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>' +
        '</svg></span>' +
        '<span class="ms-wave"><i></i><i></i><i></i></span>';
      speakBtn.addEventListener('click', () => speakText(text, speakBtn));
      msg.appendChild(speakBtn);
    }

    chatBody.appendChild(msg);
    scrollChatToBottom();
  }

  function showTypingThenReply(text) {
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatBody.appendChild(typing);
    scrollChatToBottom();

    // 模拟真人打字节奏：字数越多想得越久，加一点随机浮动，避免每次都一样快
    const base = 450;
    const perChar = 18;
    const jitter = Math.random() * 300;
    const delay = Math.min(2200, base + text.length * perChar + jitter);

    setTimeout(() => {
      typing.remove();
      addMessage(text, 'bot');
    }, delay);
  }

  function renderQuickLabels() {
    chatQuick.querySelectorAll('button').forEach(btn => {
      const topic = btn.dataset.topic;
      btn.textContent = UI[currentLang].quick[topic];
    });
  }

  function applyLangUI() {
    chatTitle.textContent = UI[currentLang].title;
    chatInput.placeholder = UI[currentLang].placeholder;
    renderQuickLabels();
  }

  function resetChat(withGreeting) {
    const bubbles = Array.from(chatBody.children);
    if (!bubbles.length) {
      if (withGreeting !== false) addMessage(UI[currentLang].greeting, 'bot');
      return;
    }
    bubbles.forEach((el, i) => {
      el.style.transition = 'opacity .3s cubic-bezier(.22,1,.36,1), transform .3s cubic-bezier(.22,1,.36,1)';
      el.style.transitionDelay = `${i * 22}ms`;
      el.style.opacity = '0';
      el.style.transform = 'translateY(5px) scale(0.98)';
    });
    setTimeout(() => {
      chatBody.innerHTML = '';
      if (withGreeting !== false) {
        addMessage(UI[currentLang].greeting, 'bot');
        const last = chatBody.lastElementChild;
        if (last) {
          last.style.opacity = '0';
          last.style.transform = 'translateY(5px) scale(0.98)';
          requestAnimationFrame(() => {
            last.style.transition = 'opacity .35s cubic-bezier(.22,1,.36,1), transform .35s cubic-bezier(.22,1,.36,1)';
            last.style.opacity = '1';
            last.style.transform = 'none';
          });
        }
      }
    }, bubbles.length * 22 + 300);
  }

  function openChat() {
    chatPanel.classList.add('open');
    chatFab.classList.add('is-open');
    chatFab.setAttribute('aria-expanded', 'true');
  }

  function closeChat() {
    chatPanel.classList.remove('open');
    chatFab.classList.remove('is-open');
    chatFab.setAttribute('aria-expanded', 'false');
  }

  chatFab.addEventListener('click', () => {
    if (chatPanel.classList.contains('open')) {
      closeChat();
    } else {
      openChat();
      unlockSpeechOnce();
      // 有些手机第一次打开时语音列表还没准备好，这里再补问一次
      if (!voicesReady) loadVoicesWithRetry();
    }
  });

  chatQuick.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const topic = btn.dataset.topic;
      addMessage(btn.textContent, 'user');
      showTypingThenReply(pickReply(currentLang, topic));
    });
  });

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    chatInput.value = '';
    const topic = detectTopic(text);
    showTypingThenReply(pickReply(currentLang, topic));
  });

  chatLang.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.lang === currentLang) return;
      chatLang.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = btn.dataset.lang;
      applyLangUI();
      populateVoiceList();
      addMessage(UI[currentLang].switched, 'bot');
    });
  });

  /* 清空聊天记录：点一次进入"确认"状态，3 秒内再点一次才会真正清空 */
  if (chatClear) {
    let confirmTimer = null;
    chatClear.addEventListener('click', () => {
      if (chatClear.classList.contains('confirm-state')) {
        clearTimeout(confirmTimer);
        chatClear.classList.remove('confirm-state');
        resetChat(true);
      } else {
        chatClear.classList.add('confirm-state');
        confirmTimer = setTimeout(() => {
          chatClear.classList.remove('confirm-state');
        }, 3000);
      }
    });
  }

  /* 声音选择：列出当前语言可用的系统语音，供切换（自定义下拉菜单） */
  if (chatVoiceBtn) {
    if (!('speechSynthesis' in window)) {
      chatVoiceRow?.classList.add('unsupported');
    } else {
      loadVoicesWithRetry();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => {
          voicesReady = true;
          populateVoiceList();
        };
      }
      chatVoiceBtn.addEventListener('click', () => {
        if (chatVoiceWrap.classList.contains('open')) closeVoiceDropdown();
        else openVoiceDropdown();
      });
      document.addEventListener('click', (e) => {
        if (!chatVoiceWrap || !chatVoiceWrap.classList.contains('open')) return;
        if (!chatVoiceWrap.contains(e.target)) closeVoiceDropdown();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeVoiceDropdown();
      });
    }
  }

  /* 语音输入：点击麦克风说话，自动转成文字填入输入框 */
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (chatMic) {
    if (!SpeechRecognitionAPI) {
      chatMic.classList.add('unsupported');
      chatMic.title = '当前浏览器不支持语音输入';
    } else {
      const recognizer = new SpeechRecognitionAPI();
      recognizer.interimResults = false;
      recognizer.maxAlternatives = 1;
      let listening = false;

      recognizer.addEventListener('result', (e) => {
        const transcript = e.results[0][0].transcript;
        chatInput.value = transcript;
        chatInput.focus();
      });

      recognizer.addEventListener('end', () => {
        listening = false;
        chatMic.setAttribute('aria-pressed', 'false');
      });

      recognizer.addEventListener('error', () => {
        listening = false;
        chatMic.setAttribute('aria-pressed', 'false');
      });

      chatMic.addEventListener('click', () => {
        if (listening) {
          recognizer.stop();
          return;
        }
        recognizer.lang = SPEECH_LANG[currentLang] || 'zh-CN';
        try {
          recognizer.start();
          listening = true;
          chatMic.setAttribute('aria-pressed', 'true');
        } catch (err) {
          listening = false;
        }
      });
    }
  }

  document.addEventListener('click', (e) => {
    if (!chatPanel.classList.contains('open')) return;
    if (chatPanel.contains(e.target) || chatFab.contains(e.target)) return;
    closeChat();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatPanel.classList.contains('open')) closeChat();
  });

  applyLangUI();
});