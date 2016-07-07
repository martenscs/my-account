/**
 * Copyright 2016 UnboundID Corp.
 * All Rights Reserved.
 */

import { Component, Input, AfterViewInit, OnChanges, ViewChild, ElementRef } from '@angular/core';


declare var qrcode: any; // NOTE: using this workaround rather than typings since they are out of date


@Component({
  selector: 'ubid-qr-code',
  template: `
    <div #container></div>
  `
})
export class QrCodeComponent implements AfterViewInit, OnChanges {
  @Input() text: string; // required - the text to use for the code

  @ViewChild('container') container: ElementRef;

  ngAfterViewInit() {
    // trigger the initial render
    this.render();
  }

  ngOnChanges(): any {
    // trigger a render (if the container is ready)
    this.render();
  }

  render() {
    var qr: any;

    if (! this.container || ! this.text) {
      return;
    }

    // type 7, "low" error correct level (7%)
    qr = qrcode(7, 'L');
    qr.addData(this.text.replace(/^[\s\u3000]+|[\s\u3000]+$/g, ''));
    qr.make();

    this.container.nativeElement.innerHTML = qr.createImgTag();
  }
}
