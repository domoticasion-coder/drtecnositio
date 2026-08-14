import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Cpu, 
  MessageCircle, 
  HelpCircle, 
  FileQuestion, 
  ArrowRight, 
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Check,
  Hammer,
  Clock
} from "lucide-react";
import { useNavigate } from "./router.js";

interface Message {
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
  whatsappUrl?: string;
  productSlug?: string;
  productName?: string;
  ticketDetails?: {
    ticket_number: string;
    customer_name: string;
    customer_dni?: string;
    device_type: string;
    brand_model: string;
    issue_description: string;
    status: string;
    status_notes?: string;
  };
  ticketMetadata?: {
    physical_received: boolean;
    received_image?: string;
    repaired_image?: string;
    diagnosis_history?: Array<{
      date: string;
      text: string;
      image?: string;
    }>;
    plain_notes?: string;
  };
}

function getCleanNotesText(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const trimmed = notes.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.plain_notes && parsed.plain_notes.trim()) {
        return parsed.plain_notes.trim();
      }
      return null;
    } catch (e) {
      return notes;
    }
  }
  return notes;
}

function parseLocalServiceMetadata(internalNotes: string | null | undefined) {
  if (!internalNotes) {
    return {
      physical_received: false,
      received_image: "",
      repaired_image: "",
      diagnosis_history: [],
      plain_notes: ""
    };
  }
  const trimmed = internalNotes.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        physical_received: !!parsed.physical_received,
        received_image: parsed.received_image || "",
        repaired_image: parsed.repaired_image || "",
        diagnosis_history: parsed.diagnosis_history || [],
        plain_notes: parsed.plain_notes || ""
      };
    } catch (e) {
      // ignore
    }
  }
  return {
    physical_received: false,
    received_image: "",
    repaired_image: "",
    diagnosis_history: [],
    plain_notes: internalNotes
  };
}

export const ChatWidget: React.FC = () => {
  const { navigate } = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "¡Hola! Soy Talos, tu asistente tecnológico en Dr Tecno. ⚡ ¿En qué puedo ayudarte hoy?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const WHATSAPP_URL = "https://wa.me/543435052020?text=Hola%20Dr%20Tecno,%20necesito%20asistencia%20personalizada%20con%20un%20equipo.";

  const quickReplies = [
    { label: "💳 Métodos de Pago", text: "¿Qué métodos de pago aceptan?" },
    { label: "🚚 Envíos y Entregas", text: "¿Hacen envíos a todo el país?" },
    { label: "🛠️ Consulta Técnica", text: "Necesito asistencia del Servicio Técnico" },
    { label: "🤖 Encontrar mi Equipo Ideal", text: "Quiero hacer el quiz de recomendación", isQuiz: true },
    { label: "🛡️ Garantía de Compra", text: "¿Qué garantía tienen los productos?" },
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Give a small typing indicator delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      let botText = "";
      let productSlug: string | undefined = undefined;
      let productName: string | undefined = undefined;
      let isTicketSuccess = false;
      let ticketDetails: any = undefined;
      let ticketMetadata: any = undefined;
      const query = textToSend.toLowerCase();

      // 1. Check for service ticket request (e.g., TEC-77908)
      const ticketMatch = textToSend.match(/TEC-\d+/i);
      if (ticketMatch) {
        const ticketNumber = ticketMatch[0].toUpperCase();
        try {
          const res = await fetch(`/api/service-requests/${encodeURIComponent(ticketNumber)}`);
          if (res.ok) {
            const data = await res.json();
            const statusLabels: Record<string, string> = {
              "recibido": "Equipo Recibido / Ingresado al Laboratorio 📦",
              "en_diagnostico": "En Diagnóstico Técnico 🔬",
              "presupuestado": "Presupuestado (Esperando tu aprobación) 📋",
              "en_reparacion": "En Reparación en Taller 🛠️",
              "listo_para_entregar": "Listo para Entregar / Retirar ✅",
              "entregado": "Dispositivo Entregado con éxito 🎉"
            };
            const statusText = statusLabels[data.status.toLowerCase()] || data.status;
            botText = `🛠️ **Estado de Reparación para Ticket ${data.ticket_number}**:\n\n` +
              `• **Cliente:** ${data.customer_name}\n` +
              `• **Dispositivo:** ${data.brand_model || data.device_type}\n` +
              `• **Falla Reportada:** ${data.issue_description}\n` +
              `• **Estado Actual:** ${statusText}`;
            const cleanNotes = getCleanNotesText(data.status_notes);
            if (cleanNotes) {
              botText += `\n• **Notas de Diagnóstico:** ${cleanNotes}`;
            }

            isTicketSuccess = true;
            ticketDetails = data;
            ticketMetadata = parseLocalServiceMetadata(data.internal_notes);
          } else {
            botText = `No se encontró ningún ticket de servicio técnico con el número **${ticketNumber}**. Por favor, verificá que esté escrito correctamente (ej: TEC-1001) o consultalo en nuestra sección de Servicio Técnico.`;
          }
        } catch (err) {
          console.error("Error fetching ticket in chat:", err);
          botText = `Ocurrió un error al consultar el ticket **${ticketNumber}**. Por favor, intentá de nuevo en unos momentos.`;
        }
      } else {
        // 2. Search for a product match in the catalog
        let products: any[] = [];
        try {
          const prodResp = await fetch("/api/products");
          if (prodResp.ok) {
            products = await prodResp.json();
          }
        } catch (err) {
          console.error("Error fetching products in chat:", err);
        }

        const normalizeText = (t: string) => {
          return t
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
        };

        const normalizedQuery = normalizeText(textToSend);
        let bestMatch: any = null;
        let maxScore = 0;

        for (const prod of products) {
          const prodNameNorm = normalizeText(prod.name);
          const prodDescNorm = normalizeText(prod.description || "");
          const prodCatNorm = normalizeText(prod.category || "");

          let score = 0;
          if (normalizedQuery.includes(prodNameNorm)) {
            score += 100;
          }
          if (prodNameNorm.includes(normalizedQuery)) {
            score += 50;
          }

          const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 3);
          let wordMatches = 0;
          for (const word of queryWords) {
            if (prodNameNorm.includes(word)) {
              wordMatches += 15;
            } else if (prodDescNorm.includes(word)) {
              wordMatches += 5;
            } else if (prodCatNorm.includes(word)) {
              wordMatches += 5;
            }
          }
          score += wordMatches;

          if (score > maxScore) {
            maxScore = score;
            bestMatch = prod;
          }
        }

        const asksAboutPriceOrProduct = query.includes("sale") || query.includes("precio") || query.includes("costo") || 
          query.includes("comprar") || query.includes("venden") || query.includes("producto") || query.includes("tienen") || 
          query.includes("tenés") || query.includes("tenes") || query.includes("soldador") || query.includes("flux") || 
          query.includes("multimetro") || query.includes("tester") || query.includes("herramienta") || query.includes("insumo") ||
          query.includes("capacitacion") || query.includes("curso");

        if (bestMatch && (maxScore > 20 || (maxScore > 5 && asksAboutPriceOrProduct))) {
          botText = `¡Sí, por supuesto! Tenemos **${bestMatch.name}** disponible en nuestro catálogo.\n\n` +
            `• **Precio:** $${bestMatch.price.toLocaleString("es-AR")}\n` +
            `• **Categoría:** ${bestMatch.category}\n` +
            `• **Detalle:** ${bestMatch.description || "Herramienta o insumo de nivel profesional."}\n\n` +
            `Hacé click en el botón de abajo para ver todos los detalles y agregarlo a tu carrito de compras:`;
          productSlug = bestMatch.slug;
          productName = bestMatch.name;
        } else {
          // Standard keyword routing
          if (query.includes("pago") || query.includes("tarjeta") || query.includes("cuotas") || query.includes("mercado")) {
            botText = "En Dr Tecno aceptamos todos los medios de pago: Tarjetas de crédito y débito mediante Mercado Pago, transferencia bancaria directa (con un 10% de descuento adicional) y efectivo contra entrega en nuestra sucursal de Buenos Aires. 💳";
          } else if (query.includes("envío") || query.includes("envio") || query.includes("entreg") || query.includes("correo")) {
            botText = "¡Sí! Hacemos envíos express a toda la Argentina. En CABA y GBA las entregas se realizan en menos de 24 horas hábiles a través de nuestra flota propia. Para el resto de las provincias enviamos por Correo Argentino, con código de seguimiento en tiempo real. 🚚";
          } else if (query.includes("técnico") || query.includes("tecnico") || query.includes("repar") || query.includes("mantenimiento") || query.includes("pantalla") || query.includes("bateria")) {
            botText = "¡Contamos con un laboratorio técnico líder en diagnóstico y reparación! Hacemos cambios de módulos en el acto para celulares y laptops. Podés registrar tu solicitud online en la sección de 'Servicio Técnico' de nuestro menú o traer tu dispositivo directamente. 🛠️";
          } else if (query.includes("quiz") || query.includes("recomend") || query.includes("elegir") || query.includes("ideal") || query.includes("dispositivo")) {
            botText = "¡Gran idea! Diseñamos un Asistente de Recomendación Inteligente para ayudarte a elegir el dispositivo perfecto según tu presupuesto y necesidades. Hacé click aquí para ir al Quiz: /quiz o encontralo en el menú principal. 🤖";
          } else if (query.includes("garant") || query.includes("cambio") || query.includes("devoluc")) {
            botText = "Todos nuestros productos tecnológicos son 100% originales y cuentan con una Garantía Oficial escrita de 12 meses. Además, ofrecemos 10 días de cambio directo si experimentás alguna falla de fábrica. ¡Tu compra está totalmente protegida! 🛡️";
          } else if (query.includes("hola") || query.includes("buenas") || query.includes("buen")) {
            botText = "¡Hola de nuevo! Es un placer saludarte. 👋 Decime qué estás buscando o seleccioná una de las opciones rápidas abajo para guiarte.";
          } else {
            botText = "Entiendo perfectamente tu consulta. Para brindarte una respuesta personalizada de inmediato, te recomiendo hablar directamente con uno de nuestros especialistas humanos a través de WhatsApp. ¿Te gustaría conectarte ahora? 💬";
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botText,
          timestamp: new Date(),
          whatsappUrl: isTicketSuccess ? undefined : `https://wa.me/543435052020?text=${encodeURIComponent(textToSend)}`,
          productSlug,
          productName,
          ticketDetails,
          ticketMetadata
        }
      ]);
    } catch (err) {
      console.error("Error in chat simulation:", err);
    } finally {
      setTyping(false);
    }
  };

  const handleQuickReply = (item: typeof quickReplies[0]) => {
    if (item.isQuiz) {
      // Add user message, bot responses and navigate
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: item.text, timestamp: new Date() },
        { sender: "bot", text: "¡Claro! Te estoy redirigiendo a nuestro recomendador inteligente en este instante. 🤖⚡", timestamp: new Date() }
      ]);
      setTimeout(() => {
        setIsOpen(false);
        navigate("/quiz");
      }, 800);
    } else {
      handleSend(item.text);
    }
  };

  return (
    <div id="chat-widget-wrapper" className="fixed bottom-6 right-6 z-40 font-sans">
      
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-2xl border border-border/40 shadow-2xl hidden sm:block animate-pulse-subtle">
            <p className="text-xs font-medium text-foreground">¿Necesitás ayuda profesional? ⚡</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-accent hover:bg-accent/90 text-[oklch(0.1_0_0)] rounded-full flex items-center justify-center shadow-lg shadow-accent/25 cursor-pointer hover:scale-105 active:scale-95 transition-all relative"
            title="Soporte Técnico Especializado"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
          </button>
        </div>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          id="chat-window" 
          className="w-[340px] sm:w-[380px] h-[500px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        >
          {/* Header */}
          <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-accent/10 rounded-lg">
                <Cpu className="w-4 h-4 text-accent animate-spin" style={{ animationDuration: "8s" }} />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-foreground">Asistencia Dr Tecno</h4>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] text-muted-foreground">Talos Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-background/40">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-accent text-accent-foreground font-medium"
                      : "bg-muted text-foreground border border-border"
                  }`}
                >
                  <div className="space-y-1">
                    {msg.text.split("\n").map((line, lineIdx) => {
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <div key={lineIdx}>
                          {parts.map((part, partIdx) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                              return <strong key={partIdx} className="font-bold text-accent">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Service Ticket Status Tracker */}
                  {msg.ticketDetails && (() => {
                    const ticket = msg.ticketDetails;
                    const metadata = msg.ticketMetadata || { physical_received: false, received_image: "", repaired_image: "", diagnosis_history: [] };
                    
                    const getActiveStepIndex = (status: string, physicalReceived: boolean) => {
                      if (status === "recibido") {
                        return physicalReceived ? 1 : 0;
                      }
                      if (status === "en_diagnostico") return 2;
                      if (status === "presupuestado") return 3;
                      if (status === "en_reparacion") return 4;
                      if (status === "listo_para_entregar") return 5;
                      if (status === "entregado") return 6;
                      return 0;
                    };

                    const statusWorkflow = [
                      { id: "pendiente", label: "Turno Registrado (Online)", desc: "Tu turno online se registró con éxito." },
                      { id: "ingresado", label: "Ingresado al Laboratorio", desc: "El equipo fue recibido físicamente en el taller." },
                      { id: "en_diagnostico", label: "En Diagnóstico", desc: "Nuestros ingenieros están diagnosticando las fallas." },
                      { id: "presupuestado", label: "Presupuestado", desc: "Presupuesto generado esperando aprobación." },
                      { id: "en_reparacion", label: "En Reparación", desc: "Reparación de alta precisión en curso." },
                      { id: "listo_para_entregar", label: "Listo para Entregar", desc: "Pruebas superadas. Podés pasar a retirarlo." },
                      { id: "entregado", label: "Entregado", desc: "Dispositivo retirado por el cliente." }
                    ];

                    const activeIdx = getActiveStepIndex(ticket.status, metadata.physical_received);

                    return (
                      <div className="mt-3.5 pt-3 border-t border-border/60 space-y-4">
                        {/* Status Badge & Title */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent font-serif">Trazabilidad de Reparación</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            ticket.status === 'entregado' || ticket.status === 'listo_para_entregar' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-logo-yellow/10 text-logo-yellow border border-logo-yellow/20'
                          }`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Summary details */}
                        <div className="bg-background/80 border border-border/40 rounded-lg p-2.5 space-y-1 text-[10.5px]">
                          <div>
                            <span className="text-muted-foreground font-semibold">Equipo: </span>
                            <span className="text-foreground font-medium">{ticket.brand_model || ticket.device_type}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold">Cliente: </span>
                            <span className="text-foreground">{ticket.customer_name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold">Problema: </span>
                            <span className="text-foreground italic">"{ticket.issue_description}"</span>
                          </div>
                        </div>

                        {/* Interactive Timeline Stepper */}
                        <div className="space-y-3">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground block font-bold">Línea de Tiempo (Roadmap):</span>
                          
                          <div className="relative pl-5 space-y-3 border-l border-border/50 ml-1.5">
                            {statusWorkflow.map((step, sIdx) => {
                              const isCompleted = sIdx <= activeIdx;
                              const isActive = sIdx === activeIdx;

                              return (
                                <div key={step.id} className="relative text-[10.5px]">
                                  {/* Bullet */}
                                  <span className={`absolute -left-[24.5px] top-0.5 h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-all ${
                                    isActive 
                                      ? "bg-logo-green border-background text-black animate-pulse shadow-md shadow-logo-green/20" 
                                      : isCompleted 
                                      ? "bg-emerald-500 border-background text-white" 
                                      : "bg-background border-border/60"
                                  }`}>
                                    {isCompleted && <Check className="w-2 h-2 text-white font-black" />}
                                  </span>

                                  <div className="space-y-0.5">
                                    <h5 className={`font-serif font-bold leading-tight ${
                                      isActive ? "text-logo-green text-[11px]" : isCompleted ? "text-foreground" : "text-muted-foreground"
                                    }`}>
                                      {step.label}
                                    </h5>
                                    <p className="text-[9px] text-muted-foreground leading-normal">{step.desc}</p>
                                    
                                    {/* Received device photo */}
                                    {step.id === "ingresado" && metadata.received_image && isCompleted && (
                                      <div className="mt-2 space-y-1">
                                        <span className="text-[8.5px] text-logo-green font-mono block font-semibold">Foto de Recepción (Ingreso):</span>
                                        <div className="border border-border/40 rounded-lg overflow-hidden max-w-[200px] bg-black/20">
                                          <img 
                                            src={metadata.received_image || undefined} 
                                            alt="Foto de ingreso" 
                                            className="max-h-24 w-auto object-contain mx-auto"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Repaired device photo */}
                                    {(step.id === "listo_para_entregar" || step.id === "entregado") && metadata.repaired_image && isCompleted && (
                                      <div className="mt-2 space-y-1">
                                        <span className="text-[8.5px] text-accent font-mono block font-semibold">Foto del Equipo Terminado:</span>
                                        <div className="border border-border/40 rounded-lg overflow-hidden max-w-[200px] bg-black/20">
                                          <img 
                                            src={metadata.repaired_image || undefined} 
                                            alt="Foto de equipo terminado" 
                                            className="max-h-24 w-auto object-contain mx-auto"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action required banner */}
                        {!metadata.physical_received && ticket.status === "recibido" && (
                          <div className="bg-logo-yellow/10 border border-logo-yellow/30 rounded-lg p-2 space-y-1 text-[9.5px]">
                            <div className="flex items-center gap-1.5 text-logo-yellow font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>SE REQUIERE ENTREGA FÍSICA</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              Por favor, acercá tu equipo a 📍 **Gualeguaychú 595, Paraná** para iniciar la reparación.
                            </p>
                          </div>
                        )}

                        {/* Diagnosis History Log Timeline with images */}
                        {metadata.diagnosis_history && metadata.diagnosis_history.length > 0 && (
                          <div className="pt-2 border-t border-border/40 space-y-2">
                            <span className="font-serif font-bold text-[9px] uppercase tracking-wider text-accent block">Trazabilidad Técnica detallada:</span>
                            <div className="space-y-2">
                              {metadata.diagnosis_history.map((log: any, lIndex: number) => (
                                <div key={lIndex} className="bg-background/50 border border-border/30 rounded-lg p-2 space-y-1.5 text-[10px]">
                                  <div className="flex justify-between items-center text-[8.5px] font-mono">
                                    <span className="text-logo-green font-bold">{log.date}</span>
                                    <span className="text-muted-foreground">Paso #{lIndex + 1}</span>
                                  </div>
                                  <p className="text-foreground leading-snug">{log.text}</p>
                                  {log.image && (
                                    <div className="mt-1.5 border border-border/20 rounded-lg overflow-hidden max-w-[180px] bg-black/20">
                                      <img 
                                        src={log.image || undefined} 
                                        alt={`Avance ${lIndex + 1}`} 
                                        className="max-h-20 w-auto object-contain mx-auto"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Product Details Redirection Button */}
                  {msg.productSlug && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/producto/${msg.productSlug}`);
                      }}
                      className="mt-2.5 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-serif font-bold uppercase tracking-wider transition-all cursor-pointer text-[10px]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Ver {msg.productName}</span>
                    </button>
                  )}

                  {/* Handle inline router links */}
                  {msg.text.includes("/quiz") && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/quiz");
                      }}
                      className="mt-2 text-accent-foreground underline block font-semibold hover:opacity-80 cursor-pointer"
                    >
                      Ir al Recomendador Inteligente →
                    </button>
                  )}
                  {msg.whatsappUrl && (
                    <a
                      href={msg.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors no-underline cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Enviar consulta por WhatsApp
                    </a>
                  )}
                  {!msg.whatsappUrl && msg.text.includes("WhatsApp") && (
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition-colors no-underline cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Contactar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
            
            {/* Bot typing simulation */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-xs flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies slider */}
          <div className="px-3 py-2 bg-muted/30 border-t border-border flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            {quickReplies.map((reply) => (
              <button
                key={reply.label}
                onClick={() => handleQuickReply(reply)}
                className="inline-block px-2.5 py-1 bg-card hover:bg-muted border border-border text-[10px] text-foreground rounded-full transition-all shrink-0 cursor-pointer"
              >
                {reply.label}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-muted border-t border-border flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Hacé tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-accent hover:bg-accent/90 disabled:bg-muted-foreground/30 disabled:text-muted-foreground text-accent-foreground rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
